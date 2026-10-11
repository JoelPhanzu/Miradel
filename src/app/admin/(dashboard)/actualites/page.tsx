import type { Metadata } from 'next'
import { desc } from 'drizzle-orm'
import { AdminPage, Badge, EmptyState, ListCard, ListRow, Thumb } from '@/components/admin/ui'
import { getDb, schema } from '@/db'
import { requireUser } from '@/lib/auth/session'

export const metadata: Metadata = { title: 'Actualités' }

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  timeZone: 'Africa/Kinshasa',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

export default async function NewsAdminPage() {
  await requireUser()
  const rows = await getDb().select().from(schema.posts).orderBy(desc(schema.posts.createdAt))
  const now = new Date()

  return (
    <AdminPage
      title="Actualités"
      description="Des actions datées et illustrées : la meilleure preuve de l'activité de la fondation."
      action={{ href: '/admin/actualites/nouveau', label: 'Écrire' }}
    >
      {rows.length === 0 ? (
        <EmptyState>Aucune actualité.</EmptyState>
      ) : (
        <ListCard>
          {rows.map((p) => (
            <li key={p.id}>
              <ListRow
                href={`/admin/actualites/${p.id}`}
                image={<Thumb src={p.imageUrl} />}
                title={p.title}
                subtitle={p.publishedAt ? dateFormatter.format(p.publishedAt) : 'Brouillon'}
                aside={
                  !p.publishedAt ? (
                    <Badge tone="muted">Brouillon</Badge>
                  ) : p.publishedAt > now ? (
                    <Badge>Programmé</Badge>
                  ) : (
                    <Badge tone="success">En ligne</Badge>
                  )
                }
              />
            </li>
          ))}
        </ListCard>
      )}
    </AdminPage>
  )
}
