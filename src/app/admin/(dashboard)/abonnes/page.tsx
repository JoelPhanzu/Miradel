import type { Metadata } from 'next'
import { desc } from 'drizzle-orm'
import { DownloadSimple } from '@phosphor-icons/react/ssr'
import { AdminPage, Badge, EmptyState, ListCard } from '@/components/admin/ui'
import { getDb, schema } from '@/db'
import { requireUser } from '@/lib/auth/session'
import { formatLongDate } from '@/lib/dates'

export const metadata: Metadata = { title: 'Abonnés newsletter' }

export default async function SubscribersPage() {
  await requireUser()
  const rows = await getDb()
    .select()
    .from(schema.newsletterSubscribers)
    .orderBy(desc(schema.newsletterSubscribers.createdAt))
  const active = rows.filter((r) => r.consent && !r.unsubscribedAt).length

  return (
    <AdminPage
      title="Abonnés newsletter"
      description={`${active} abonné${active > 1 ? 's' : ''} actif${active > 1 ? 's' : ''}. L'envoi des lettres se fait hors du site : exportez la liste.`}
    >
      <a
        href="/api/admin/abonnes"
        className="bg-accent text-accent-ink mb-6 inline-flex min-h-12 items-center gap-2 rounded-full px-5 text-sm font-semibold"
      >
        <DownloadSimple size={18} aria-hidden />
        Exporter (CSV)
      </a>
      {rows.length === 0 ? (
        <EmptyState>Aucun abonné pour le moment.</EmptyState>
      ) : (
        <ListCard>
          {rows.map((r) => (
            <li key={r.id} className="flex min-h-16 items-center justify-between gap-4 px-4 py-3">
              <span className="min-w-0">
                <span className="block truncate font-semibold">{r.email}</span>
                <span className="text-ink-soft block text-sm">
                  Inscrit le {formatLongDate(r.createdAt)}
                </span>
              </span>
              {r.unsubscribedAt ? (
                <Badge tone="muted">Désinscrit</Badge>
              ) : (
                <Badge tone="success">Actif</Badge>
              )}
            </li>
          ))}
        </ListCard>
      )}
    </AdminPage>
  )
}
