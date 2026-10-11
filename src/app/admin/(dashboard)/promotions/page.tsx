import type { Metadata } from 'next'
import { asc } from 'drizzle-orm'
import { MoveButtons } from '@/components/admin/MoveButtons'
import { AdminPage, Badge, EmptyState, ListCard, ListRow } from '@/components/admin/ui'
import { getDb, schema } from '@/db'
import { requireUser } from '@/lib/auth/session'
import { movePromotion } from './actions'

export const metadata: Metadata = { title: 'Promotions' }

const TYPE_LABELS = {
  percentage: (v: number) => `-${v} %`,
  fixed_amount: (v: number) => `-${v.toLocaleString('fr-FR')} FC`,
  display_only: () => 'Affichage seul',
}

export default async function PromotionsAdminPage() {
  await requireUser()
  const rows = await getDb()
    .select()
    .from(schema.promotions)
    .orderBy(asc(schema.promotions.position))
  const now = new Date()

  return (
    <AdminPage
      title="Promotions"
      description="Une seule promotion s'applique par article : celle qui donne le prix le plus bas."
      action={{ href: '/admin/promotions/nouveau', label: 'Créer' }}
    >
      {rows.length === 0 ? (
        <EmptyState>Aucune promotion.</EmptyState>
      ) : (
        <ListCard>
          {rows.map((p, i) => {
            const ended = p.endsAt && p.endsAt < now
            return (
              <li key={p.id} className="flex items-center pr-1">
                <div className="min-w-0 grow">
                  <ListRow
                    href={`/admin/promotions/${p.id}`}
                    title={p.title}
                    subtitle={TYPE_LABELS[p.discountType](p.discountValue)}
                    aside={
                      ended ? (
                        <Badge tone="muted">Terminée</Badge>
                      ) : p.isActive ? (
                        <Badge tone="success">Active</Badge>
                      ) : (
                        <Badge tone="muted">Suspendue</Badge>
                      )
                    }
                  />
                </div>
                <MoveButtons
                  onMove={movePromotion.bind(null, p.id)}
                  first={i === 0}
                  last={i === rows.length - 1}
                  label={p.title}
                />
              </li>
            )
          })}
        </ListCard>
      )}
    </AdminPage>
  )
}
