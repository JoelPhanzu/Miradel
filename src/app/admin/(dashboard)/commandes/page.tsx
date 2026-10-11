import type { Metadata } from 'next'
import Link from 'next/link'
import { desc, eq, inArray } from 'drizzle-orm'
import { AdminPage, Badge, EmptyState, ListCard, ListRow } from '@/components/admin/ui'
import { getDb, schema } from '@/db'
import { ORDER_STATUSES } from '@/db/schema'
import { ORDER_TONES } from '@/lib/admin/labels'
import { requireUser } from '@/lib/auth/session'
import { formatAmount, formatDateTime } from '@/lib/format'

export const metadata: Metadata = { title: 'Commandes' }

export default async function OrdersPage({ searchParams }: PageProps<'/admin/commandes'>) {
  await requireUser()
  const { statut } = await searchParams
  const status = ORDER_STATUSES.find((s) => s === statut)
  const toProcess = !statut

  const rows = await getDb()
    .select()
    .from(schema.orders)
    .where(
      status
        ? eq(schema.orders.status, status)
        : toProcess
          ? inArray(schema.orders.status, ['nouvelle', 'confirmée', 'payée'])
          : undefined,
    )
    .orderBy(desc(schema.orders.createdAt))
    .limit(200)

  const pill = (active: boolean) =>
    `inline-flex min-h-11 shrink-0 items-center rounded-full border px-4 text-sm font-semibold capitalize ${
      active ? 'bg-ink text-cream border-ink' : 'border-line'
    }`

  return (
    <AdminPage title="Commandes">
      <nav aria-label="Statut" className="-mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
        <Link href="/admin/commandes" className={pill(toProcess)}>
          À traiter
        </Link>
        {ORDER_STATUSES.map((s) => (
          <Link key={s} href={`/admin/commandes?statut=${s}`} className={pill(s === status)}>
            {s}
          </Link>
        ))}
      </nav>

      <div className="mt-6">
        {rows.length === 0 ? (
          <EmptyState>Aucune commande pour ce filtre.</EmptyState>
        ) : (
          <ListCard>
            {rows.map((o) => (
              <li key={o.id}>
                <ListRow
                  href={`/admin/commandes/${o.id}`}
                  title={`${o.reference} - ${o.customerName}`}
                  subtitle={`${formatDateTime(o.createdAt)} - ${formatAmount(o.totalAmount, o.currency)}`}
                  aside={<Badge tone={ORDER_TONES[o.status]}>{o.status}</Badge>}
                />
              </li>
            ))}
          </ListCard>
        )}
      </div>
    </AdminPage>
  )
}
