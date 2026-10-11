'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { getDb, schema } from '@/db'
import { DONATION_STATUSES } from '@/db/schema'
import { audit, failure, optionalText, success, type ActionState } from '@/lib/admin/server'
import { requireUser } from '@/lib/auth/session'

type Status = (typeof DONATION_STATUSES)[number]

/** Confirmation (fonds reçus) ou rejet d'une déclaration de don. */
export async function setDonationStatus(id: string, status: Status): Promise<ActionState> {
  const user = await requireUser()
  if (!DONATION_STATUSES.includes(status)) return failure({}, 'Statut inconnu')
  const db = getDb()
  const [before] = await db.select().from(schema.donations).where(eq(schema.donations.id, id))
  if (!before) return failure({}, 'Don introuvable')
  await db.update(schema.donations).set({ status }).where(eq(schema.donations.id, id))
  await audit('donations', id, 'UPDATE', user.id, { status: before.status }, { status })
  revalidatePath('/admin/dons')
  revalidatePath('/admin')
  return success(`Don ${status}`)
}

export async function saveDonationDetails(
  id: string,
  _state: ActionState,
  fd: FormData,
): Promise<ActionState> {
  const user = await requireUser()
  const values = {
    transactionReference: optionalText(fd, 'transactionReference'),
    internalNote: optionalText(fd, 'internalNote'),
  }
  const db = getDb()
  const [before] = await db.select().from(schema.donations).where(eq(schema.donations.id, id))
  if (!before) return failure({}, 'Don introuvable')
  await db.update(schema.donations).set(values).where(eq(schema.donations.id, id))
  await audit(
    'donations',
    id,
    'UPDATE',
    user.id,
    { transactionReference: before.transactionReference, internalNote: before.internalNote },
    values,
  )
  revalidatePath(`/admin/dons/${id}`)
  return success()
}
