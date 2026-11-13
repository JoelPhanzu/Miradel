'use server'

import { eq } from 'drizzle-orm'
import { getDb, schema } from '@/db'
import { moveItem, nextPosition } from '@/lib/admin/reorder'
import {
  audit,
  failure,
  optionalText,
  refresh,
  success,
  text,
  uniqueSlug,
  type ActionState,
} from '@/lib/admin/server'
import { requireUser } from '@/lib/auth/session'
import { CACHE_TAGS } from '@/lib/data/public'

const table = schema.sectors
const TAGS = [CACHE_TAGS.entrepreneurs]

export async function saveSector(
  id: string | null,
  _state: ActionState,
  fd: FormData,
): Promise<ActionState> {
  const user = await requireUser()
  const name = text(fd, 'name')
  if (!name) return failure({ name: 'Indiquez un nom' })
  const values = { name, description: optionalText(fd, 'description') }

  const db = getDb()
  if (id) {
    const [before] = await db.select().from(table).where(eq(table.id, id))
    if (!before) return failure({}, 'Secteur introuvable')
    const slug = before.name === name ? before.slug : await uniqueSlug(table, name, id)
    await db
      .update(table)
      .set({ ...values, slug })
      .where(eq(table.id, id))
    await audit('sectors', id, 'UPDATE', user.id, before, values)
    refresh(TAGS, '/admin/secteurs')
    return success()
  }
  const newId = crypto.randomUUID()
  await db.insert(table).values({
    ...values,
    id: newId,
    slug: await uniqueSlug(table, name),
    position: await nextPosition(table),
  })
  await audit('sectors', newId, 'INSERT', user.id, null, values)
  refresh(TAGS, '/admin/secteurs')
  return success('Secteur créé', newId)
}

/** Les entrepreneurs du secteur restent en ligne, classés dans « Autres activités ». */
export async function deleteSector(id: string): Promise<ActionState> {
  const user = await requireUser()
  const db = getDb()
  const [before] = await db.select().from(table).where(eq(table.id, id))
  await db.delete(table).where(eq(table.id, id))
  await audit('sectors', id, 'DELETE', user.id, before ?? null, null)
  refresh(TAGS, '/admin/secteurs')
  return success('Secteur supprimé')
}

export async function moveSector(id: string, direction: 'up' | 'down'): Promise<void> {
  await requireUser()
  if (await moveItem(table, id, direction)) refresh(TAGS)
}
