import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { WhatsappLogo } from '@phosphor-icons/react/ssr'
import { AdminForm, TextAreaField, TextField } from '@/components/admin/form'
import { StatusButtons } from '@/components/admin/StatusButtons'
import { AdminPage } from '@/components/admin/ui'
import { getDb, schema } from '@/db'
import { ORDER_STATUSES } from '@/db/schema'
import { requireUser } from '@/lib/auth/session'
import { formatAmount, formatPhone } from '@/lib/format'
import { getSiteSettings } from '@/lib/data/public'
import { DELIVERY_LABELS, PAYMENT_LABELS } from '@/lib/messages'
import { buildWhatsAppUrl } from '@/lib/whatsapp'
import { saveOrderDetails, setOrderStatus } from '../actions'

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  timeZone: 'Africa/Kinshasa',
  dateStyle: 'full',
  timeStyle: 'short',
})

export default async function OrderPage({ params }: PageProps<'/admin/commandes/[id]'>) {
  await requireUser()
  const { id } = await params
  const db = getDb()
  const [[order], items, settings] = await Promise.all([
    db.select().from(schema.orders).where(eq(schema.orders.id, id)),
    db.select().from(schema.orderItems).where(eq(schema.orderItems.orderId, id)),
    getSiteSettings(),
  ])
  if (!order) notFound()

  const reply = buildWhatsAppUrl(
    order.customerPhone,
    `Bonjour ${order.customerName}, ici la ${settings.organizationName} au sujet de votre commande ${order.reference}. `,
  )

  return (
    <AdminPage
      title={order.reference}
      description={dateFormatter.format(order.createdAt)}
      back={{ href: '/admin/commandes', label: 'Commandes' }}
    >
      <div className="grid gap-8">
        <div className="bg-cream-deep rounded-3xl p-5">
          <p className="font-display text-2xl font-semibold">{order.customerName}</p>
          <p className="text-ink-soft">{formatPhone(order.customerPhone)}</p>
          <p className="mt-2">
            {DELIVERY_LABELS[order.deliveryMode]}
            {order.deliveryMode === 'livraison' &&
              ` : ${[order.deliveryCommune, order.deliveryAddress].filter(Boolean).join(', ')}`}
          </p>
          <p className="mt-1">Paiement : {PAYMENT_LABELS[order.paymentMethod]}</p>
          {order.message && <p className="mt-3 italic">« {order.message} »</p>}
          <a
            href={reply}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-whatsapp mt-5 inline-flex min-h-12 items-center gap-2 rounded-full px-5 text-sm font-semibold text-white dark:text-[#10261a]"
          >
            <WhatsappLogo size={18} weight="fill" aria-hidden />
            Répondre sur WhatsApp
          </a>
        </div>

        <section>
          <h2 className="mb-3 font-semibold">Articles</h2>
          <ul className="divide-line border-line divide-y rounded-3xl border">
            {items.map((item) => {
              const variant = Object.values(item.variant).join(', ')
              return (
                <li key={item.id} className="flex justify-between gap-4 p-4">
                  <span>
                    {item.quantity} x {item.productName}
                    {variant && <span className="text-ink-soft"> ({variant})</span>}
                    {item.discountAmount > 0 && (
                      <span className="text-accent block text-sm">
                        Remise : -{formatAmount(item.discountAmount, item.currency)} / article
                      </span>
                    )}
                  </span>
                  <span className="font-semibold whitespace-nowrap">
                    {formatAmount(item.unitPriceAmount * item.quantity, item.currency)}
                  </span>
                </li>
              )
            })}
            <li className="flex justify-between p-4 text-lg font-semibold">
              <span>Total</span>
              <span>{formatAmount(order.totalAmount, order.currency)}</span>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 font-semibold">Statut</h2>
          <StatusButtons
            statuses={ORDER_STATUSES}
            current={order.status}
            onChange={setOrderStatus.bind(null, order.id)}
          />
          <p className="text-ink-soft mt-2 text-sm">
            Pensez à ajuster le stock du produit après une vente.
          </p>
        </section>

        <section>
          <h2 className="font-display mb-4 text-2xl font-semibold">Paiement et notes</h2>
          <AdminForm action={saveOrderDetails.bind(null, order.id)}>
            <TextField
              name="paymentReference"
              label="Référence du paiement (mobile money ou virement)"
              defaultValue={order.paymentReference}
              hint="Saisissez-la avant de passer la commande à « payée »."
            />
            <TextAreaField
              name="internalNote"
              label="Note interne"
              defaultValue={order.internalNote}
              rows={3}
            />
          </AdminForm>
        </section>
      </div>
    </AdminPage>
  )
}
