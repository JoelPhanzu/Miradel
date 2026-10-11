import type { Metadata } from 'next'
import { asc } from 'drizzle-orm'
import { MoveButtons } from '@/components/admin/MoveButtons'
import { AdminPage, Badge, EmptyState, ListCard, ListRow, Thumb } from '@/components/admin/ui'
import { getDb, schema } from '@/db'
import { PROGRAM_STATUS_LABELS } from '@/lib/admin/labels'
import { requireUser } from '@/lib/auth/session'
import { moveProgram } from './actions'

export const metadata: Metadata = { title: 'Programmes' }

export default async function ProgramsAdminPage() {
  await requireUser()
  const rows = await getDb().select().from(schema.programs).orderBy(asc(schema.programs.position))

  return (
    <AdminPage
      title="Programmes"
      description="L'ordre de la liste est celui du site."
      action={{ href: '/admin/programmes/nouveau', label: 'Ajouter' }}
    >
      {rows.length === 0 ? (
        <EmptyState>Aucun programme pour le moment.</EmptyState>
      ) : (
        <ListCard>
          {rows.map((p, i) => (
            <li key={p.id} className="flex items-center pr-1">
              <div className="min-w-0 grow">
                <ListRow
                  href={`/admin/programmes/${p.id}`}
                  image={<Thumb src={p.coverImageUrl} />}
                  title={p.title}
                  subtitle={PROGRAM_STATUS_LABELS[p.status]}
                  aside={
                    p.isPublished ? (
                      <Badge tone="success">En ligne</Badge>
                    ) : (
                      <Badge tone="muted">Masqué</Badge>
                    )
                  }
                />
              </div>
              <MoveButtons
                onMove={moveProgram.bind(null, p.id)}
                first={i === 0}
                last={i === rows.length - 1}
                label={p.title}
              />
            </li>
          ))}
        </ListCard>
      )}
    </AdminPage>
  )
}
