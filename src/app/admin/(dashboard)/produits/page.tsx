import type { Metadata } from 'next'
import { asc } from 'drizzle-orm'
import { MoveButtons } from '@/components/admin/MoveButtons'
import { AdminPage, Badge, EmptyState, ListCard, ListRow, Thumb } from '@/components/admin/ui'
import { getDb, schema } from '@/db'
import { requireUser } from '@/lib/auth/session'
import { formatAmount } from '@/lib/format'
import { moveProduct } from './actions'

export const metadata: Metadata = { title: 'Produits' }

export default async function ProductsAdminPage() {
  await requireUser()
  const rows = await getDb().select().from(schema.products).orderBy(asc(schema.products.position))

  return (
    <AdminPage
      title="Produits"
      description="L'ordre de la liste est celui de la boutique."
      action={{ href: '/admin/produits/nouveau', label: 'Ajouter' }}
    >
      {rows.length === 0 ? (
        <EmptyState>Aucun produit pour le moment.</EmptyState>
      ) : (
        <ListCard>
          {rows.map((p, i) => (
            <li key={p.id} className="flex items-center pr-1">
              <div className="min-w-0 grow">
                <ListRow
                  href={`/admin/produits/${p.id}`}
                  image={<Thumb src={p.images[0]} />}
                  title={p.name}
                  subtitle={
                    p.priceAmount === null
                      ? 'Prix à confirmer'
                      : formatAmount(p.priceAmount, p.currency)
                  }
                  aside={
                    <>
                      {p.isPublished ? (
                        <Badge tone="success">En ligne</Badge>
                      ) : (
                        <Badge tone="muted">Masqué</Badge>
                      )}
                      {p.priceAmount === null && <Badge tone="warning">Prix à confirmer</Badge>}
                      {p.stock === 0 && <Badge tone="warning">Rupture</Badge>}
                    </>
                  }
                />
              </div>
              <MoveButtons
                onMove={moveProduct.bind(null, p.id)}
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
