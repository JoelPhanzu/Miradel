import type { Metadata } from 'next'
import { asc } from 'drizzle-orm'
import { MoveButtons } from '@/components/admin/MoveButtons'
import { AdminPage, Badge, EmptyState, ListCard, ListRow, Thumb } from '@/components/admin/ui'
import { getDb, schema } from '@/db'
import { requireUser } from '@/lib/auth/session'
import { moveMember } from './actions'

export const metadata: Metadata = { title: 'Équipe' }

export default async function TeamAdminPage() {
  await requireUser()
  const rows = await getDb()
    .select()
    .from(schema.teamMembers)
    .orderBy(asc(schema.teamMembers.position))

  return (
    <AdminPage
      title="Équipe"
      description="Les responsables et membres affichés sur la page « La Fondation ». Montrer qui dirige renforce la confiance."
      action={{ href: '/admin/equipe/nouveau', label: 'Ajouter' }}
    >
      {rows.length === 0 ? (
        <EmptyState>Personne pour le moment.</EmptyState>
      ) : (
        <ListCard>
          {rows.map((m, i) => (
            <li key={m.id} className="flex items-center pr-1">
              <div className="min-w-0 grow">
                <ListRow
                  href={`/admin/equipe/${m.id}`}
                  image={<Thumb src={m.photoUrl} />}
                  title={m.fullName}
                  subtitle={m.role}
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
                onMove={moveMember.bind(null, m.id)}
                first={i === 0}
                last={i === rows.length - 1}
                label={m.fullName}
              />
            </li>
          ))}
        </ListCard>
      )}
    </AdminPage>
  )
}
