'use server'

import { eq } from 'drizzle-orm'
import { getDb, schema } from '@/db'
import { DOCUMENT_TYPES } from '@/db/schema'
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
import { MEDIA_URL_PREFIX } from '@/lib/server/uploads'

const TAGS = [CACHE_TAGS.documents]

export async function saveDocument(
  id: string | null,
  _state: ActionState,
  fd: FormData,
): Promise<ActionState> {
  const user = await requireUser()
  const errors: Record<string, string> = {}
  const title = text(fd, 'title')
  if (!title) errors.title = 'Indiquez le titre du document'
  const type = DOCUMENT_TYPES.find((t) => t === text(fd, 'type'))
  if (!type) errors.type = 'Choisissez le type de document'
  const year = optionalInt(fd, 'year')
  if (year !== null && (year < 1950 || year > 2100)) errors.year = 'Année invalide'
  const fileUrl = text(fd, 'fileUrl')
  if (!fileUrl.startsWith(MEDIA_URL_PREFIX) || !fileUrl.endsWith('.pdf')) {
    errors.fileUrl = 'Envoyez le fichier PDF'
  }
  const fileSizeBytes = optionalInt(fd, 'fileSizeBytes') ?? 0
  if (Object.keys(errors).length) return failure(errors)

  const values = {
    title,
    type: type!,
    year,
    fileUrl,
    fileSizeBytes,
    description: optionalText(fd, 'description'),
    isPublished: checked(fd, 'isPublished'),
  }
  const db = getDb()
  if (id) {
    const [before] = await db.select().from(schema.documents).where(eq(schema.documents.id, id))
    if (!before) return failure({}, 'Document introuvable')
    await db.update(schema.documents).set(values).where(eq(schema.documents.id, id))
    await audit('documents', id, 'UPDATE', user.id, before, values)
    refresh(TAGS, '/admin/documents')
    return success()
  }
  const newId = crypto.randomUUID()
  await db
    .insert(schema.documents)
    .values({ ...values, id: newId, position: await nextPosition(schema.documents) })
  await audit('documents', newId, 'INSERT', user.id, null, values)
  refresh(TAGS, '/admin/documents')
  return success('Document ajouté', newId)
}

export async function deleteDocument(id: string): Promise<ActionState> {
  const user = await requireUser()
  const db = getDb()
  const [before] = await db.select().from(schema.documents).where(eq(schema.documents.id, id))
  await db.delete(schema.documents).where(eq(schema.documents.id, id))
  await audit('documents', id, 'DELETE', user.id, before ?? null, null)
  refresh(TAGS, '/admin/documents')
  return success('Document supprimé')
}

export async function moveDocument(id: string, direction: 'up' | 'down'): Promise<void> {
  await requireUser()
  if (await moveItem(schema.documents, id, direction)) refresh(TAGS)
}
