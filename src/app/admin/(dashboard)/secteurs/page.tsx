import type { Metadata } from 'next'
import { asc } from 'drizzle-orm'
import { MoveButtons } from '@/components/admin/MoveButtons'
import { AdminPage, EmptyState, ListCard, ListRow } from '@/components/admin/ui'
import { getDb, schema } from '@/db'
import { requireUser } from '@/lib/auth/session'
import { moveSector } from './actions'

export const metadata: Metadata = { title: 'Secteurs d’activité' }

export default async function SectorsPage() {
  await requireUser()
  const db = getDb()
  const [rows, people] = await Promise.all([
    db.select().from(schema.sectors).orderBy(asc(schema.sectors.position)),
    db.select({ sectorId: schema.entrepreneurs.sectorId }).from(schema.entrepreneurs),
  ])

  return (
    <AdminPage
      title="Secteurs d’activité"
      description="La Vitrine de l’entrepreneur classe les entrepreneurs par secteur (ex. couture, transformation agricole), dans cet ordre."
      action={{ href: '/admin/secteurs/nouveau', label: 'Ajouter' }}
    >
      {rows.length === 0 ? (
        <EmptyState>
          Aucun secteur : les entrepreneurs apparaissent dans « Autres activités ».
        </EmptyState>
      ) : (
        <ListCard>
          {rows.map((s, i) => {
            const n = people.filter((p) => p.sectorId === s.id).length
            return (
              <li key={s.id} className="flex items-center pr-1">
                <div className="min-w-0 grow">
                  <ListRow
                    href={`/admin/secteurs/${s.id}`}
                    title={s.name}
                    subtitle={`${n} entrepreneur${n > 1 ? 's' : ''}`}
                  />
                </div>
                <MoveButtons
                  onMove={moveSector.bind(null, s.id)}
                  first={i === 0}
                  last={i === rows.length - 1}
                  label={s.name}
                />
              </li>
            )
          })}
        </ListCard>
      )}
    </AdminPage>
  )
}
