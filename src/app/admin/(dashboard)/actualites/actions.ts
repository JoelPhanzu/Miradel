'use server'

import { eq } from 'drizzle-orm'
import { getDb, schema } from '@/db'
import { parseKinshasaLocal } from '@/lib/admin/kinshasa-time'
import {
  audit,
  checked,
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

const TAGS = [CACHE_TAGS.posts]

export async function savePost(
  id: string | null,
  _state: ActionState,
  fd: FormData,
): Promise<ActionState> {
  const user = await requireUser()
  const errors: Record<string, string> = {}
  const title = text(fd, 'title')
  if (!title) errors.title = 'Indiquez un titre'

  // Publié : date choisie, sinon maintenant. Une date future programme la publication.
  const published = checked(fd, 'published')
  const dateRaw = text(fd, 'publishedAt')
  const chosenDate = dateRaw ? parseKinshasaLocal(dateRaw) : null
  if (dateRaw && !chosenDate) errors.publishedAt = 'Date invalide'
  if (Object.keys(errors).length) return failure(errors)

  const values = {
    title,
    excerpt: optionalText(fd, 'excerpt'),
    content: optionalText(fd, 'content'),
    imageUrl: optionalText(fd, 'imageUrl'),
    programId: optionalText(fd, 'programId'),
    publishedAt: published ? (chosenDate ?? new Date()) : null,
    seoTitle: optionalText(fd, 'seoTitle'),
    seoDescription: optionalText(fd, 'seoDescription'),
  }

  const db = getDb()
  if (id) {
    const [before] = await db.select().from(schema.posts).where(eq(schema.posts.id, id))
    if (!before) return failure({}, 'Actualité introuvable')
    const slug = before.title === title ? before.slug : await uniqueSlug(schema.posts, title, id)
    await db
      .update(schema.posts)
      .set({ ...values, slug })
      .where(eq(schema.posts.id, id))
    await audit('posts', id, 'UPDATE', user.id, before, values)
    refresh(TAGS, '/admin/actualites')
    return success()
  }
  const newId = crypto.randomUUID()
  await db
    .insert(schema.posts)
    .values({ ...values, id: newId, slug: await uniqueSlug(schema.posts, title) })
  await audit('posts', newId, 'INSERT', user.id, null, values)
  refresh(TAGS, '/admin/actualites')
  return success('Actualité créée', newId)
}

export async function deletePost(id: string): Promise<ActionState> {
  const user = await requireUser()
  const db = getDb()
  const [before] = await db.select().from(schema.posts).where(eq(schema.posts.id, id))
  await db.delete(schema.posts).where(eq(schema.posts.id, id))
  await audit('posts', id, 'DELETE', user.id, before ?? null, null)
  refresh(TAGS, '/admin/actualites')
  return success('Actualité supprimée')
}
