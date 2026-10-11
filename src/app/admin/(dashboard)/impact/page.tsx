import type { Metadata } from 'next'
import { asc } from 'drizzle-orm'
import { MoveButtons } from '@/components/admin/MoveButtons'
import { AdminPage, Badge, EmptyState, ListCard, ListRow } from '@/components/admin/ui'
import { getDb, schema } from '@/db'
import { requireUser } from '@/lib/auth/session'
import { formatNumber } from '@/lib/format'
import { moveMetric } from './actions'

export const metadata: Metadata = { title: 'Chiffres d’impact' }

export default async function ImpactAdminPage() {
  await requireUser()
  const rows = await getDb()
    .select()
    .from(schema.impactMetrics)
    .orderBy(asc(schema.impactMetrics.position))

  return (
    <AdminPage
      title="Chiffres d’impact"
      description="Chaque chiffre doit pouvoir être justifié : la source (rapport, liste de présence…) est obligatoire et reste interne."
      action={{ href: '/admin/impact/nouveau', label: 'Ajouter' }}
    >
      {rows.length === 0 ? (
        <EmptyState>
          Aucun chiffre pour le moment. La section « Notre impact » reste discrète tant
          qu&apos;aucun chiffre n&apos;est publié.
        </EmptyState>
      ) : (
        <ListCard>
          {rows.map((m, i) => (
            <li key={m.id} className="flex items-center pr-1">
              <div className="min-w-0 grow">
                <ListRow
                  href={`/admin/impact/${m.id}`}
                  title={`${formatNumber(m.value)}${m.unit ? ` ${m.unit}` : ''} - ${m.label}`}
                  subtitle={m.period ?? 'Sans période'}
                  aside={
                    m.isPublished ? (
                      <Badge tone="success">En ligne</Badge>
                    ) : (
                      <Badge tone="muted">Masqué</Badge>
                    )
                  }
                />
              </div>
              <MoveButtons
                onMove={moveMetric.bind(null, m.id)}
                first={i === 0}
                last={i === rows.length - 1}
                label={m.label}
              />
            </li>
          ))}
        </ListCard>
      )}
    </AdminPage>
  )
}
