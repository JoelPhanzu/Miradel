'use server'

import { eq } from 'drizzle-orm'
import { getDb, schema } from '@/db'
import { moveItem, nextPosition } from '@/lib/admin/reorder'
import {
  audit,
  checked,
  failure,
  optionalInt,
  optionalText,
  refresh,
  success,
  text,
  type ActionState,
} from '@/lib/admin/server'
import { requireUser } from '@/lib/auth/session'
import { CACHE_TAGS } from '@/lib/data/public'

const TAGS = [CACHE_TAGS.impact]

export async function saveMetric(
  id: string | null,
  _state: ActionState,
  fd: FormData,
): Promise<ActionState> {
  const user = await requireUser()
  const errors: Record<string, string> = {}
  const label = text(fd, 'label')
  if (!label) errors.label = 'Indiquez ce qui est compté (ex. « femmes formées »)'
  const value = optionalInt(fd, 'value')
  if (value === null || value < 0) errors.value = 'Indiquez un nombre'
  // Aucun chiffre sans justification : c'est la crédibilité de la fondation.
  const source = text(fd, 'source')
  if (source.length < 5) errors.source = 'Indiquez la source du chiffre (obligatoire)'
  if (Object.keys(errors).length) return failure(errors)

  const values = {
    label,
    value: value!,
    unit: optionalText(fd, 'unit'),
    period: optionalText(fd, 'period'),
    source,
    programId: optionalText(fd, 'programId'),
    isPublished: checked(fd, 'isPublished'),
  }
  const db = getDb()
  if (id) {
    const [before] = await db
      .select()
      .from(schema.impactMetrics)
      .where(eq(schema.impactMetrics.id, id))
    if (!before) return failure({}, 'Chiffre introuvable')
    await db.update(schema.impactMetrics).set(values).where(eq(schema.impactMetrics.id, id))
    await audit('impact_metrics', id, 'UPDATE', user.id, before, values)
    refresh(TAGS, '/admin/impact')
    return success()
  }
  const newId = crypto.randomUUID()
  await db
    .insert(schema.impactMetrics)
    .values({ ...values, id: newId, position: await nextPosition(schema.impactMetrics) })
  await audit('impact_metrics', newId, 'INSERT', user.id, null, values)
  refresh(TAGS, '/admin/impact')
  return success('Chiffre ajouté', newId)
}

export async function deleteMetric(id: string): Promise<ActionState> {
  const user = await requireUser()
  const db = getDb()
  const [before] = await db
    .select()
    .from(schema.impactMetrics)
    .where(eq(schema.impactMetrics.id, id))
  await db.delete(schema.impactMetrics).where(eq(schema.impactMetrics.id, id))
  await audit('impact_metrics', id, 'DELETE', user.id, before ?? null, null)
  refresh(TAGS, '/admin/impact')
  return success('Chiffre supprimé')
}

export async function moveMetric(id: string, direction: 'up' | 'down'): Promise<void> {
  await requireUser()
  if (await moveItem(schema.impactMetrics, id, direction)) refresh(TAGS)
}
