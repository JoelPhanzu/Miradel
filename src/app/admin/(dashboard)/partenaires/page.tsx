import type { Metadata } from 'next'
import { asc } from 'drizzle-orm'
import { MoveButtons } from '@/components/admin/MoveButtons'
import { AdminPage, Badge, EmptyState, ListCard, ListRow, Thumb } from '@/components/admin/ui'
import { getDb, schema } from '@/db'
import { requireUser } from '@/lib/auth/session'
import { movePartner } from './actions'

export const metadata: Metadata = { title: 'Partenaires' }

export default async function PartnersAdminPage() {
  await requireUser()
  const rows = await getDb().select().from(schema.partners).orderBy(asc(schema.partners.position))

  return (
    <AdminPage
      title="Partenaires"
      description="Uniquement des partenaires réels, qui ont accepté d'apparaître sur le site."
      action={{ href: '/admin/partenaires/nouveau', label: 'Ajouter' }}
    >
      {rows.length === 0 ? (
        <EmptyState>Aucun partenaire pour le moment.</EmptyState>
      ) : (
        <ListCard>
          {rows.map((p, i) => (
            <li key={p.id} className="flex items-center pr-1">
              <div className="min-w-0 grow">
                <ListRow
                  href={`/admin/partenaires/${p.id}`}
                  image={<Thumb src={p.logoUrl} />}
                  title={p.name}
                  subtitle={p.websiteUrl}
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
                onMove={movePartner.bind(null, p.id)}
                first={i === 0}
                last={i === rows.length - 1}
                label={p.name}
              />
            </li>
          ))}
        </ListCard>
      )}
    </AdminPage>
  )
}
