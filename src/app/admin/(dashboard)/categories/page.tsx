import type { Metadata } from 'next'
import { asc } from 'drizzle-orm'
import { MoveButtons } from '@/components/admin/MoveButtons'
import { AdminPage, EmptyState, ListCard, ListRow, Thumb } from '@/components/admin/ui'
import { getDb, schema } from '@/db'
import { requireUser } from '@/lib/auth/session'
import { moveCategory } from './actions'

export const metadata: Metadata = { title: 'Catégories' }

export default async function CategoriesPage() {
  await requireUser()
  const rows = await getDb()
    .select()
    .from(schema.productCategories)
    .orderBy(asc(schema.productCategories.position))

  return (
    <AdminPage
      title="Catégories"
      description="Elles regroupent les produits de la boutique (ex. Agro-alimentaire, Hygiène)."
      action={{ href: '/admin/categories/nouveau', label: 'Ajouter' }}
    >
      {rows.length === 0 ? (
        <EmptyState>Aucune catégorie.</EmptyState>
      ) : (
        <ListCard>
          {rows.map((c, i) => (
            <li key={c.id} className="flex items-center pr-1">
              <div className="min-w-0 grow">
                <ListRow
                  href={`/admin/categories/${c.id}`}
                  image={<Thumb src={c.imageUrl} />}
                  title={c.name}
                />
              </div>
              <MoveButtons
                onMove={moveCategory.bind(null, c.id)}
                first={i === 0}
                last={i === rows.length - 1}
                label={c.name}
              />
            </li>
          ))}
        </ListCard>
      )}
    </AdminPage>
  )
}
