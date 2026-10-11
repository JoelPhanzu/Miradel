import type { Metadata } from 'next'
import Link from 'next/link'
import { desc, eq } from 'drizzle-orm'
import { AdminPage, Badge, EmptyState, ListCard, ListRow } from '@/components/admin/ui'
import { getDb, schema } from '@/db'
import { DONATION_STATUSES } from '@/db/schema'
import { DONATION_TONES } from '@/lib/admin/labels'
import { requireUser } from '@/lib/auth/session'
import { formatAmount, formatDateTime } from '@/lib/format'
import { KINSHASA_TIME_ZONE } from '@/lib/pricing'

export const metadata: Metadata = { title: 'Dons' }

const monthFormatter = new Intl.DateTimeFormat('fr-FR', {
  timeZone: KINSHASA_TIME_ZONE,
  month: 'long',
  year: 'numeric',
})

export default async function DonationsPage({ searchParams }: PageProps<'/admin/dons'>) {
  await requireUser()
  const { statut } = await searchParams
  const status = DONATION_STATUSES.find((s) => s === statut) ?? 'déclaré'
  const db = getDb()

  const [rows, confirmed] = await Promise.all([
    db
      .select()
      .from(schema.donations)
      .where(eq(schema.donations.status, status))
      .orderBy(desc(schema.donations.createdAt))
      .limit(200),
    db
      .select({
        amount: schema.donations.amount,
        currency: schema.donations.currency,
        createdAt: schema.donations.createdAt,
      })
      .from(schema.donations)
      .where(eq(schema.donations.status, 'confirmé'))
      .orderBy(desc(schema.donations.createdAt)),
  ])

  // Totaux confirmés par mois et par devise, sans conversion entre devises.
  const totals = new Map<string, { CDF: number; USD: number }>()
  for (const d of confirmed) {
    const month = monthFormatter.format(d.createdAt)
    const entry = totals.get(month) ?? { CDF: 0, USD: 0 }
    entry[d.currency] += d.amount
    totals.set(month, entry)
  }

  const pill = (active: boolean) =>
    `inline-flex min-h-11 shrink-0 items-center rounded-full border px-4 text-sm font-semibold capitalize ${
      active ? 'bg-ink text-cream border-ink' : 'border-line'
    }`

  return (
    <AdminPage
      title="Dons"
      description="Le site enregistre une déclaration. Confirmez le don seulement après avoir vérifié la réception des fonds."
    >
      <nav aria-label="Statut" className="-mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
        {DONATION_STATUSES.map((s) => (
          <Link key={s} href={`/admin/dons?statut=${s}`} className={pill(s === status)}>
            {s === 'déclaré' ? 'À confirmer' : s}
          </Link>
        ))}
      </nav>

      <div className="mt-6">
        {rows.length === 0 ? (
          <EmptyState>Aucun don pour ce filtre.</EmptyState>
        ) : (
          <ListCard>
            {rows.map((d) => (
              <li key={d.id}>
                <ListRow
                  href={`/admin/dons/${d.id}`}
                  title={`${formatAmount(d.amount, d.currency)} - ${d.donorName ?? 'Anonyme'}`}
                  subtitle={`${d.reference} - ${formatDateTime(d.createdAt)}`}
                  aside={<Badge tone={DONATION_TONES[d.status]}>{d.status}</Badge>}
                />
              </li>
            ))}
          </ListCard>
        )}
      </div>

      <section className="mt-12">
        <h2 className="font-display text-3xl font-semibold">Dons confirmés par mois</h2>
        <div className="mt-4">
          {totals.size === 0 ? (
            <EmptyState>Aucun don confirmé pour le moment.</EmptyState>
          ) : (
            <ul className="divide-line border-line divide-y rounded-3xl border">
              {[...totals].map(([month, t]) => (
                <li key={month} className="flex flex-wrap justify-between gap-2 p-4">
                  <span className="capitalize">{month}</span>
                  <span className="font-semibold">
                    {[
                      t.CDF ? formatAmount(t.CDF, 'CDF') : null,
                      t.USD ? formatAmount(t.USD, 'USD') : null,
                    ]
                      .filter(Boolean)
                      .join(' + ')}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </AdminPage>
  )
}
