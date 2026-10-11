import type { Metadata } from 'next'
import Link from 'next/link'
import { and, desc, eq, type SQL } from 'drizzle-orm'
import { AdminPage, Badge, EmptyState, ListCard, ListRow } from '@/components/admin/ui'
import { getDb, schema } from '@/db'
import { MESSAGE_KINDS, MESSAGE_STATUSES } from '@/db/schema'
import { MESSAGE_KIND_LABELS, MESSAGE_STATUS_LABELS, MESSAGE_TONES } from '@/lib/admin/labels'
import { requireUser } from '@/lib/auth/session'
import { formatDateTime } from '@/lib/format'

export const metadata: Metadata = { title: 'Messages' }

export default async function MessagesPage({ searchParams }: PageProps<'/admin/messages'>) {
  await requireUser()
  const { statut, type } = await searchParams
  const status = MESSAGE_STATUSES.find((s) => s === statut)
  const kind = MESSAGE_KINDS.find((k) => k === type)

  const conditions: SQL[] = []
  if (status) conditions.push(eq(schema.contactMessages.status, status))
  if (kind) conditions.push(eq(schema.contactMessages.kind, kind))
  const rows = await getDb()
    .select()
    .from(schema.contactMessages)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(schema.contactMessages.createdAt))
    .limit(200)

  const pill = (active: boolean) =>
    `inline-flex min-h-11 shrink-0 items-center rounded-full border px-4 text-sm font-semibold ${
      active ? 'bg-ink text-cream border-ink' : 'border-line'
    }`
  const link = (params: { statut?: string; type?: string }) => {
    const query = new URLSearchParams(
      Object.entries({ statut: status, type: kind, ...params }).filter(
        (e): e is [string, string] => Boolean(e[1]),
      ),
    ).toString()
    return `/admin/messages${query ? `?${query}` : ''}`
  }

  return (
    <AdminPage
      title="Messages"
      description="Formulaires de contact, de bénévolat et de partenariat."
    >
      <div className="grid gap-3">
        <nav aria-label="Type" className="-mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
          <Link href={link({ type: '' })} className={pill(!kind)}>
            Tous
          </Link>
          {MESSAGE_KINDS.map((k) => (
            <Link key={k} href={link({ type: k })} className={pill(k === kind)}>
              {MESSAGE_KIND_LABELS[k]}
            </Link>
          ))}
        </nav>
        <nav aria-label="Statut" className="-mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
          <Link href={link({ statut: '' })} className={pill(!status)}>
            Tous statuts
          </Link>
          {MESSAGE_STATUSES.map((s) => (
            <Link key={s} href={link({ statut: s })} className={pill(s === status)}>
              {MESSAGE_STATUS_LABELS[s]}
            </Link>
          ))}
        </nav>
      </div>

      <div className="mt-6">
        {rows.length === 0 ? (
          <EmptyState>Aucun message pour ce filtre.</EmptyState>
        ) : (
          <ListCard>
            {rows.map((m) => (
              <li key={m.id}>
                <ListRow
                  href={`/admin/messages/${m.id}`}
                  title={`${m.fullName}${m.organization ? ` (${m.organization})` : ''}`}
                  subtitle={`${formatDateTime(m.createdAt)} - ${m.message}`}
                  aside={
                    <>
                      <Badge tone={MESSAGE_TONES[m.status]}>
                        {MESSAGE_STATUS_LABELS[m.status]}
                      </Badge>
                      <span className="text-ink-soft text-xs">{MESSAGE_KIND_LABELS[m.kind]}</span>
                    </>
                  }
                />
              </li>
            ))}
          </ListCard>
        )}
      </div>
    </AdminPage>
  )
}
