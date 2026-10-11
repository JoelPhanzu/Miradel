import type { Metadata } from 'next'
import { asc } from 'drizzle-orm'
import { MoveButtons } from '@/components/admin/MoveButtons'
import { AdminPage, Badge, EmptyState, ListCard, ListRow } from '@/components/admin/ui'
import { getDb, schema } from '@/db'
import { requireUser } from '@/lib/auth/session'
import { moveTestimonial } from './actions'

export const metadata: Metadata = { title: 'Témoignages' }

export default async function TestimonialsAdminPage() {
  await requireUser()
  const rows = await getDb()
    .select()
    .from(schema.testimonials)
    .orderBy(asc(schema.testimonials.position))

  return (
    <AdminPage
      title="Témoignages"
      description="Uniquement de vrais témoignages, publiés avec l'accord de la personne. La section n'apparaît sur le site que s'il y a au moins un témoignage publié."
      action={{ href: '/admin/temoignages/nouveau', label: 'Ajouter' }}
    >
      {rows.length === 0 ? (
        <EmptyState>Aucun témoignage pour le moment.</EmptyState>
      ) : (
        <ListCard>
          {rows.map((t, i) => (
            <li key={t.id} className="flex items-center pr-1">
              <div className="min-w-0 grow">
                <ListRow
                  href={`/admin/temoignages/${t.id}`}
                  title={t.displayName}
                  subtitle={t.body}
                  aside={
                    t.isPublished ? (
                      <Badge tone="success">En ligne</Badge>
                    ) : t.consentObtained ? (
                      <Badge tone="muted">Masqué</Badge>
                    ) : (
                      <Badge tone="warning">Accord manquant</Badge>
                    )
                  }
                />
              </div>
              <MoveButtons
                onMove={moveTestimonial.bind(null, t.id)}
                first={i === 0}
                last={i === rows.length - 1}
                label={t.displayName}
              />
            </li>
          ))}
        </ListCard>
      )}
    </AdminPage>
  )
}
