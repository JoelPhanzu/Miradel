import type { Metadata } from 'next'
import { asc } from 'drizzle-orm'
import { MoveButtons } from '@/components/admin/MoveButtons'
import { AdminPage, Badge, EmptyState, ListCard, ListRow } from '@/components/admin/ui'
import { getDb, schema } from '@/db'
import { requireUser } from '@/lib/auth/session'
import { moveValue } from './actions'

export const metadata: Metadata = { title: 'Valeurs et principes' }

export default async function ValuesAdminPage() {
  await requireUser()
  const rows = await getDb()
    .select()
    .from(schema.organizationValues)
    .orderBy(asc(schema.organizationValues.position))

  return (
    <AdminPage
      title="Valeurs et principes d’action"
      description="Affichés sur l’accueil et la page La Fondation, dans cet ordre."
      action={{ href: '/admin/valeurs/nouveau', label: 'Ajouter' }}
    >
      {rows.length === 0 ? (
        <EmptyState>
          Aucune valeur pour le moment : le site affiche « [À COMPLÉTER] » à cet endroit.
        </EmptyState>
      ) : (
        <ListCard>
          {rows.map((v, i) => (
            <li key={v.id} className="flex items-center pr-1">
              <div className="min-w-0 grow">
                <ListRow
                  href={`/admin/valeurs/${v.id}`}
                  title={v.title}
                  subtitle={v.kind === 'valeur' ? 'Valeur' : 'Principe d’action'}
                  aside={
                    v.isPublished ? (
                      <Badge tone="success">En ligne</Badge>
                    ) : (
                      <Badge tone="muted">Masqué</Badge>
                    )
                  }
                />
              </div>
              <MoveButtons
                onMove={moveValue.bind(null, v.id)}
                first={i === 0}
                last={i === rows.length - 1}
                label={v.title}
              />
            </li>
          ))}
        </ListCard>
      )}
    </AdminPage>
  )
}
