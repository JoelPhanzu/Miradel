import type { Metadata } from 'next'
import { asc } from 'drizzle-orm'
import { MoveButtons } from '@/components/admin/MoveButtons'
import { AdminPage, Badge, EmptyState, ListCard, ListRow } from '@/components/admin/ui'
import { getDb, schema } from '@/db'
import { DOCUMENT_TYPE_LABELS } from '@/lib/admin/labels'
import { requireUser } from '@/lib/auth/session'
import { formatFileSize } from '@/lib/format'
import { moveDocument } from './actions'

export const metadata: Metadata = { title: 'Documents' }

export default async function DocumentsAdminPage() {
  await requireUser()
  const rows = await getDb()
    .select()
    .from(schema.documents)
    .orderBy(asc(schema.documents.position))

  return (
    <AdminPage
      title="Documents"
      description="Statuts, agréments, rapports d'activité et financiers, téléchargeables depuis la page Transparence."
      action={{ href: '/admin/documents/nouveau', label: 'Ajouter' }}
    >
      {rows.length === 0 ? (
        <EmptyState>Aucun document publié pour le moment.</EmptyState>
      ) : (
        <ListCard>
          {rows.map((d, i) => (
            <li key={d.id} className="flex items-center pr-1">
              <div className="min-w-0 grow">
                <ListRow
                  href={`/admin/documents/${d.id}`}
                  title={d.title}
                  subtitle={`${DOCUMENT_TYPE_LABELS[d.type]}${d.year ? ` ${d.year}` : ''} - ${formatFileSize(d.fileSizeBytes)}`}
                  aside={
                    d.isPublished ? (
                      <Badge tone="success">En ligne</Badge>
                    ) : (
                      <Badge tone="muted">Masqué</Badge>
                    )
                  }
                />
              </div>
              <MoveButtons
                onMove={moveDocument.bind(null, d.id)}
                first={i === 0}
                last={i === rows.length - 1}
                label={d.title}
              />
            </li>
          ))}
        </ListCard>
      )}
    </AdminPage>
  )
}
