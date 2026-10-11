'use server'

import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { getDb, schema } from '@/db'
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

const TAGS = [CACHE_TAGS.partners]

export async function savePartner(
  id: string | null,
  _state: ActionState,
  fd: FormData,
): Promise<ActionState> {
  const user = await requireUser()
  const errors: Record<string, string> = {}
  const name = text(fd, 'name')
  if (!name) errors.name = 'Indiquez le nom du partenaire'
  const websiteUrl = optionalText(fd, 'websiteUrl')
  if (websiteUrl && !z.url().safeParse(websiteUrl).success) {
    errors.websiteUrl = 'Lien invalide (doit commencer par https://)'
  }
  if (Object.keys(errors).length) return failure(errors)

  const values = {
    name,
    logoUrl: optionalText(fd, 'logoUrl'),
    websiteUrl,
    isPublished: checked(fd, 'isPublished'),
  }
  const db = getDb()
  if (id) {
    const [before] = await db.select().from(schema.partners).where(eq(schema.partners.id, id))
    if (!before) return failure({}, 'Partenaire introuvable')
    await db.update(schema.partners).set(values).where(eq(schema.partners.id, id))
    await audit('partners', id, 'UPDATE', user.id, before, values)
    refresh(TAGS, '/admin/partenaires')
    return success()
  }
  const newId = crypto.randomUUID()
  await db
    .insert(schema.partners)
    .values({ ...values, id: newId, position: await nextPosition(schema.partners) })
  await audit('partners', newId, 'INSERT', user.id, null, values)
  refresh(TAGS, '/admin/partenaires')
  return success('Partenaire ajouté', newId)
}

export async function deletePartner(id: string): Promise<ActionState> {
  const user = await requireUser()
  const db = getDb()
  const [before] = await db.select().from(schema.partners).where(eq(schema.partners.id, id))
  await db.delete(schema.partners).where(eq(schema.partners.id, id))
  await audit('partners', id, 'DELETE', user.id, before ?? null, null)
  refresh(TAGS, '/admin/partenaires')
  return success('Partenaire retiré')
}

export async function movePartner(id: string, direction: 'up' | 'down'): Promise<void> {
  await requireUser()
  if (await moveItem(schema.partners, id, direction)) refresh(TAGS)
}
