'use server'

import { eq } from 'drizzle-orm'
import { getDb, schema } from '@/db'
import { VALUE_KINDS } from '@/db/schema'
import { moveItem, nextPosition } from '@/lib/admin/reorder'
import {
  audit,
  checked,
  failure,
  optionalText,
  refresh,
  success,
  text,
  type ActionState,
} from '@/lib/admin/server'
import { requireUser } from '@/lib/auth/session'
import { CACHE_TAGS } from '@/lib/data/public'

const TAGS = [CACHE_TAGS.values]

export async function saveValue(
  id: string | null,
  _state: ActionState,
  fd: FormData,
): Promise<ActionState> {
  const user = await requireUser()
  const errors: Record<string, string> = {}
  const title = text(fd, 'title')
  if (!title) errors.title = 'Indiquez la valeur ou le principe'
  const kind = text(fd, 'kind') as (typeof VALUE_KINDS)[number]
  if (!VALUE_KINDS.includes(kind)) errors.kind = 'Choisissez « Valeur » ou « Principe d’action »'
  const description = optionalText(fd, 'description')
  if (description && description.length > 600) errors.description = '600 caractères au maximum'
  if (Object.keys(errors).length) return failure(errors)

  const values = { kind, title, description, isPublished: checked(fd, 'isPublished') }
  const db = getDb()
  if (id) {
    const [before] = await db
      .select()
      .from(schema.organizationValues)
      .where(eq(schema.organizationValues.id, id))
    if (!before) return failure({}, 'Élément introuvable')
    await db
      .update(schema.organizationValues)
      .set(values)
      .where(eq(schema.organizationValues.id, id))
    await audit('organization_values', id, 'UPDATE', user.id, before, values)
    refresh(TAGS, '/admin/valeurs')
    return success()
  }
  const newId = crypto.randomUUID()
  await db
    .insert(schema.organizationValues)
    .values({ ...values, id: newId, position: await nextPosition(schema.organizationValues) })
  await audit('organization_values', newId, 'INSERT', user.id, null, values)
  refresh(TAGS, '/admin/valeurs')
  return success('Ajouté', newId)
}

export async function deleteValue(id: string): Promise<ActionState> {
  const user = await requireUser()
  const db = getDb()
  const [before] = await db
    .select()
    .from(schema.organizationValues)
    .where(eq(schema.organizationValues.id, id))
  await db.delete(schema.organizationValues).where(eq(schema.organizationValues.id, id))
  await audit('organization_values', id, 'DELETE', user.id, before ?? null, null)
  refresh(TAGS, '/admin/valeurs')
  return success('Supprimé')
}

export async function moveValue(id: string, direction: 'up' | 'down'): Promise<void> {
  await requireUser()
  if (await moveItem(schema.organizationValues, id, direction)) refresh(TAGS)
}
