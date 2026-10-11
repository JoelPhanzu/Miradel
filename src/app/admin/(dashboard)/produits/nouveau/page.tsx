import { asc } from 'drizzle-orm'
import { AdminPage } from '@/components/admin/ui'
import { getDb, schema } from '@/db'
import { requireUser } from '@/lib/auth/session'
import { ProductForm } from '../ProductForm'

export default async function NewProductPage() {
  await requireUser()
  const db = getDb()
  const [categories, programs] = await Promise.all([
    db
      .select({ id: schema.productCategories.id, name: schema.productCategories.name })
      .from(schema.productCategories)
      .orderBy(asc(schema.productCategories.position)),
    db
      .select({ id: schema.programs.id, title: schema.programs.title })
      .from(schema.programs)
      .orderBy(asc(schema.programs.position)),
  ])
  return (
    <AdminPage title="Nouveau produit" back={{ href: '/admin/produits', label: 'Produits' }}>
      <ProductForm categories={categories} programs={programs} />
    </AdminPage>
  )
}
