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

const table = schema.productCategories
const TAGS = [CACHE_TAGS.products]

export async function saveCategory(
  id: string | null,
  _state: ActionState,
  fd: FormData,
): Promise<ActionState> {
  const user = await requireUser()
  const name = text(fd, 'name')
  if (!name) return failure({ name: 'Indiquez un nom' })
  const values = {
    name,
    description: optionalText(fd, 'description'),
    imageUrl: optionalText(fd, 'imageUrl'),
  }

  const db = getDb()
  if (id) {
    const [before] = await db.select().from(table).where(eq(table.id, id))
    if (!before) return failure({}, 'Catégorie introuvable')
    const slug = before.name === name ? before.slug : await uniqueSlug(table, name, id)
    await db
      .update(table)
      .set({ ...values, slug })
      .where(eq(table.id, id))
    await audit('product_categories', id, 'UPDATE', user.id, before, values)
    refresh(TAGS, '/admin/categories')
    return success()
  }

  const newId = crypto.randomUUID()
  await db.insert(table).values({
    ...values,
    id: newId,
    slug: await uniqueSlug(table, name),
    position: await nextPosition(table),
  })
  await audit('product_categories', newId, 'INSERT', user.id, null, values)
  refresh(TAGS, '/admin/categories')
  return success('Catégorie créée', newId)
}

/** Les produits de la catégorie restent en ligne, simplement « sans catégorie ». */
export async function deleteCategory(id: string): Promise<ActionState> {
  const user = await requireUser()
  const db = getDb()
  const [before] = await db.select().from(table).where(eq(table.id, id))
  await db.delete(table).where(eq(table.id, id))
  await audit('product_categories', id, 'DELETE', user.id, before ?? null, null)
  refresh(TAGS, '/admin/categories')
  return success('Catégorie supprimée')
}

export async function moveCategory(id: string, direction: 'up' | 'down'): Promise<void> {
  await requireUser()
  if (await moveItem(table, id, direction)) refresh(TAGS)
}
