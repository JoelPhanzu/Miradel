import Link from 'next/link'
import { desc, eq, inArray } from 'drizzle-orm'
import { Newspaper, PlusCircle, Tag } from '@phosphor-icons/react/ssr'
import { AdminPage, Badge, EmptyState, ListCard, ListRow } from '@/components/admin/ui'
import { getDb, schema } from '@/db'
import { DONATION_TONES, MESSAGE_KIND_LABELS, ORDER_TONES } from '@/lib/admin/labels'
import { requireUser } from '@/lib/auth/session'
import { getPromotions } from '@/lib/data/public'
import { formatAmount, formatDateTime } from '@/lib/format'
import { getActivePromotions } from '@/lib/pricing'

function Section({
  title,
  href,
  empty,
  children,
}: {
  title: string
  href?: string
  empty: string | null
  children: React.ReactNode
}) {
  return (
    <section>
      <div className="flex items-end justify-between gap-4">
        <h2 className="font-display text-3xl font-semibold">{title}</h2>
        {href && (
          <Link href={href} className="text-accent min-h-11 text-sm font-semibold">
            Tout voir
          </Link>
        )}
      </div>
      <div className="mt-4">{empty ? <EmptyState>{empty}</EmptyState> : children}</div>
    </section>
  )
}

/** Accueil de l'admin : ce qui attend une action de l'équipe. */
export default async function DashboardPage() {
  const user = await requireUser()
  const db = getDb()

  const [pendingOrders, declaredDonations, newMessages, promotions] = await Promise.all([
    db
      .select()
      .from(schema.orders)
      .where(inArray(schema.orders.status, ['nouvelle', 'confirmée', 'payée']))
      .orderBy(desc(schema.orders.createdAt))
      .limit(6),
    db
      .select()
      .from(schema.donations)
      .where(eq(schema.donations.status, 'déclaré'))
      .orderBy(desc(schema.donations.createdAt))
      .limit(6),
    db
      .select()
      .from(schema.contactMessages)
      .where(eq(schema.contactMessages.status, 'nouveau'))
      .orderBy(desc(schema.contactMessages.createdAt))
      .limit(6),
    getPromotions(),
  ])
  const activeToday = getActivePromotions(promotions, new Date())

  const shortcuts = [
    { href: '/admin/actualites/nouveau', label: 'Publier une actualité', Icon: Newspaper },
    { href: '/admin/produits/nouveau', label: 'Ajouter un produit', Icon: PlusCircle },
    { href: '/admin/promotions/nouveau', label: 'Créer une promotion', Icon: Tag },
  ]

  return (
    <AdminPage title={`Bonjour ${user.fullName.split(' ')[0]}`}>
      <div className="grid gap-10">
        <ul className="grid grid-cols-3 gap-3">
          {shortcuts.map(({ href, label, Icon }) => (
            <li key={href}>
              <Link
                href={href}
                className="border-line hover:border-ink flex h-full min-h-24 flex-col items-start justify-between gap-2 rounded-3xl border p-3 text-sm font-semibold md:p-4"
              >
                <Icon size={24} className="text-accent" aria-hidden />
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <Section
          title="Dons à confirmer"
          href="/admin/dons"
          empty={declaredDonations.length === 0 ? 'Aucun don en attente de confirmation.' : null}
        >
          <ListCard>
            {declaredDonations.map((d) => (
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
        </Section>

        <Section
          title="Commandes à traiter"
          href="/admin/commandes"
          empty={pendingOrders.length === 0 ? 'Aucune commande en attente.' : null}
        >
          <ListCard>
            {pendingOrders.map((o) => (
              <li key={o.id}>
                <ListRow
                  href={`/admin/commandes/${o.id}`}
                  title={`${o.reference} - ${o.customerName}`}
                  subtitle={formatAmount(o.totalAmount, o.currency)}
                  aside={<Badge tone={ORDER_TONES[o.status]}>{o.status}</Badge>}
                />
              </li>
            ))}
          </ListCard>
        </Section>

        <Section
          title="Messages non lus"
          href="/admin/messages"
          empty={newMessages.length === 0 ? 'Aucun nouveau message.' : null}
        >
          <ListCard>
            {newMessages.map((m) => (
              <li key={m.id}>
                <ListRow
                  href={`/admin/messages/${m.id}`}
                  title={m.fullName}
                  subtitle={m.message}
                  aside={<Badge>{MESSAGE_KIND_LABELS[m.kind]}</Badge>}
                />
              </li>
            ))}
          </ListCard>
        </Section>

        <Section
          title="Promotions actives aujourd’hui"
          empty={activeToday.length === 0 ? 'Aucune promotion active aujourd’hui.' : null}
        >
          <ListCard>
            {activeToday.map((p) => (
              <li key={p.id}>
                <ListRow href={`/admin/promotions/${p.id}`} title={p.title} subtitle={p.subtitle} />
              </li>
            ))}
          </ListCard>
        </Section>
      </div>
    </AdminPage>
  )
}
