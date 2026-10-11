'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { getDb, schema } from '@/db'
import { MESSAGE_STATUSES } from '@/db/schema'
import { audit, failure, optionalText, success, type ActionState } from '@/lib/admin/server'
import { requireUser } from '@/lib/auth/session'

type Status = (typeof MESSAGE_STATUSES)[number]

export async function setMessageStatus(id: string, status: Status): Promise<ActionState> {
  const user = await requireUser()
  if (!MESSAGE_STATUSES.includes(status)) return failure({}, 'Statut inconnu')
  const db = getDb()
  const [before] = await db
    .select({ status: schema.contactMessages.status })
    .from(schema.contactMessages)
    .where(eq(schema.contactMessages.id, id))
  if (!before) return failure({}, 'Message introuvable')
  await db.update(schema.contactMessages).set({ status }).where(eq(schema.contactMessages.id, id))
  await audit('contact_messages', id, 'UPDATE', user.id, before, { status })
  revalidatePath('/admin/messages')
  revalidatePath('/admin')
  return success()
}

export async function saveMessageNote(
  id: string,
  _state: ActionState,
  fd: FormData,
): Promise<ActionState> {
  await requireUser()
  await getDb()
    .update(schema.contactMessages)
    .set({ internalNote: optionalText(fd, 'internalNote') })
    .where(eq(schema.contactMessages.id, id))
  revalidatePath(`/admin/messages/${id}`)
  return success()
}

/** Suppression définitive (données personnelles) : à faire une fois le message traité. */
export async function deleteMessage(id: string): Promise<ActionState> {
  const user = await requireUser()
  await getDb().delete(schema.contactMessages).where(eq(schema.contactMessages.id, id))
  await audit('contact_messages', id, 'DELETE', user.id, null, null)
  revalidatePath('/admin/messages')
  return success('Message supprimé')
}
