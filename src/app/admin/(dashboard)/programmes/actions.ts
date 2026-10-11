'use server'

import { eq } from 'drizzle-orm'
import { getDb, schema } from '@/db'
import { PROGRAM_STATUSES } from '@/db/schema'
import { moveItem, nextPosition } from '@/lib/admin/reorder'
import {
  audit,
  checked,
  failure,
  jsonField,
  optionalText,
  refresh,
  success,
  text,
  uniqueSlug,
  type ActionState,
} from '@/lib/admin/server'
import { requireUser } from '@/lib/auth/session'
import { CACHE_TAGS } from '@/lib/data/public'

// Le titre d'un programme apparaît aussi sur les produits, actualités et témoignages liés.
const TAGS = [CACHE_TAGS.programs, CACHE_TAGS.testimonials]

export async function saveProgram(
  id: string | null,
  _state: ActionState,
  fd: FormData,
): Promise<ActionState> {
  const user = await requireUser()
  const errors: Record<string, string> = {}
  const title = text(fd, 'title')
  if (!title) errors.title = 'Indiquez le nom du programme'
  const status = PROGRAM_STATUSES.find((s) => s === text(fd, 'status'))
  if (!status) errors.status = 'Choisissez un état'
  const gallery = jsonField<string[]>(fd, 'gallery', [])
  const galleryConsent = checked(fd, 'galleryConsent')
  if (Object.keys(errors).length) return failure(errors)

  const values = {
    title,
    summary: optionalText(fd, 'summary'),
    content: optionalText(fd, 'content'),
    coverImageUrl: optionalText(fd, 'coverImageUrl'),
    gallery,
    galleryConsent,
    areas: optionalText(fd, 'areas'),
    beneficiaries: optionalText(fd, 'beneficiaries'),
    status: status!,
    isPublished: checked(fd, 'isPublished'),
  }

  const db = getDb()
  if (id) {
    const [before] = await db.select().from(schema.programs).where(eq(schema.programs.id, id))
    if (!before) return failure({}, 'Programme introuvable')
    const slug = before.title === title ? before.slug : await uniqueSlug(schema.programs, title, id)
    await db
      .update(schema.programs)
      .set({ ...values, slug })
      .where(eq(schema.programs.id, id))
    await audit('programs', id, 'UPDATE', user.id, before, values)
    refresh(TAGS, '/admin/programmes')
    return success()
  }

  const newId = crypto.randomUUID()
  await db.insert(schema.programs).values({
    ...values,
    id: newId,
    slug: await uniqueSlug(schema.programs, title),
    position: await nextPosition(schema.programs),
  })
  await audit('programs', newId, 'INSERT', user.id, null, values)
  refresh(TAGS, '/admin/programmes')
  return success('Programme créé', newId)
}

/** Les produits, actualités, chiffres et dons liés restent, simplement sans programme. */
export async function deleteProgram(id: string): Promise<ActionState> {
  const user = await requireUser()
  const db = getDb()
  const [before] = await db.select().from(schema.programs).where(eq(schema.programs.id, id))
  await db.delete(schema.programs).where(eq(schema.programs.id, id))
  await audit('programs', id, 'DELETE', user.id, before ?? null, null)
  refresh([...TAGS, CACHE_TAGS.products, CACHE_TAGS.posts, CACHE_TAGS.impact], '/admin/programmes')
  return success('Programme supprimé')
}

export async function moveProgram(id: string, direction: 'up' | 'down'): Promise<void> {
  await requireUser()
  if (await moveItem(schema.programs, id, direction)) refresh(TAGS)
}
