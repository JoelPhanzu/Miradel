import type { Metadata } from 'next'
import { asc } from 'drizzle-orm'
import { MoveButtons } from '@/components/admin/MoveButtons'
import { AdminPage, Badge, EmptyState, ListCard, ListRow, Thumb } from '@/components/admin/ui'
import { getDb, schema } from '@/db'
import { requireUser } from '@/lib/auth/session'
import { moveEntrepreneur } from './actions'

export const metadata: Metadata = { title: 'Entrepreneurs (vitrines)' }

export default async function EntrepreneursAdminPage() {
  await requireUser()
  const db = getDb()
  const [rows, sectors, products] = await Promise.all([
    db.select().from(schema.entrepreneurs).orderBy(asc(schema.entrepreneurs.position)),
    db.select({ id: schema.sectors.id, name: schema.sectors.name }).from(schema.sectors),
    db.select({ entrepreneurId: schema.products.entrepreneurId }).from(schema.products),
  ])
  const sectorName = new Map(sectors.map((s) => [s.id, s.name]))

  return (
    <AdminPage
      title="Entrepreneurs"
      description="Chaque entrepreneur accompagné a sa vitrine : présentation, contact WhatsApp et produits. La fondation a la sienne."
      action={{ href: '/admin/entrepreneurs/nouveau', label: 'Ajouter' }}
    >
      {rows.length === 0 ? (
        <EmptyState>Aucune vitrine pour le moment.</EmptyState>
      ) : (
        <ListCard>
          {rows.map((e, i) => {
            const n = products.filter((p) => p.entrepreneurId === e.id).length
            const sector = e.isFoundation
              ? 'La fondation'
              : ((e.sectorId && sectorName.get(e.sectorId)) ?? 'Sans secteur')
            return (
              <li key={e.id} className="flex items-center pr-1">
                <div className="min-w-0 grow">
                  <ListRow
                    href={`/admin/entrepreneurs/${e.id}`}
                    image={<Thumb src={e.coverImageUrl} />}
                    title={e.name}
                    subtitle={`${sector} · ${n} produit${n > 1 ? 's' : ''}`}
                    aside={
                      <>
                        {e.isPublished ? (
                          <Badge tone="success">En ligne</Badge>
                        ) : (
                          <Badge tone="muted">Masquée</Badge>
                        )}
                        {e.isFeatured && <Badge>À l’accueil</Badge>}
                      </>
                    }
                  />
                </div>
                <MoveButtons
                  onMove={moveEntrepreneur.bind(null, e.id)}
                  first={i === 0}
                  last={i === rows.length - 1}
                  label={e.name}
                />
              </li>
            )
          })}
        </ListCard>
      )}
    </AdminPage>
  )
}
