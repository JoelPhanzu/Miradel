'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { getDb, schema } from '@/db'
import { ORDER_STATUSES } from '@/db/schema'
import { audit, failure, optionalText, success, type ActionState } from '@/lib/admin/server'
import { requireUser } from '@/lib/auth/session'

type Status = (typeof ORDER_STATUSES)[number]

export async function setOrderStatus(id: string, status: Status): Promise<ActionState> {
  const user = await requireUser()
  if (!ORDER_STATUSES.includes(status)) return failure({}, 'Statut inconnu')
  const db = getDb()
  const [before] = await db.select().from(schema.orders).where(eq(schema.orders.id, id))
  if (!before) return failure({}, 'Commande introuvable')
  await db.update(schema.orders).set({ status }).where(eq(schema.orders.id, id))
  await audit('orders', id, 'UPDATE', user.id, { status: before.status }, { status })
  revalidatePath('/admin/commandes')
  revalidatePath('/admin')
  return success(`Commande ${status}`)
}

/** Référence de transaction mobile money et note interne. */
export async function saveOrderDetails(
  id: string,
  _state: ActionState,
  fd: FormData,
): Promise<ActionState> {
  const user = await requireUser()
  const values = {
    paymentReference: optionalText(fd, 'paymentReference'),
    internalNote: optionalText(fd, 'internalNote'),
  }
  const db = getDb()
  const [before] = await db.select().from(schema.orders).where(eq(schema.orders.id, id))
  if (!before) return failure({}, 'Commande introuvable')
  await db.update(schema.orders).set(values).where(eq(schema.orders.id, id))
  await audit(
    'orders',
    id,
    'UPDATE',
    user.id,
    { paymentReference: before.paymentReference, internalNote: before.internalNote },
    values,
  )
  revalidatePath(`/admin/commandes/${id}`)
  return success()
}
