import { asc, eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { AdminPage } from '@/components/admin/ui'
import { getDb, schema } from '@/db'
import { requireUser } from '@/lib/auth/session'
import { ProductForm } from '../ProductForm'

export default async function EditProductPage({ params }: PageProps<'/admin/produits/[id]'>) {
  await requireUser()
  const { id } = await params
  const db = getDb()
  const [[product], categories, programs, entrepreneurs] = await Promise.all([
    db.select().from(schema.products).where(eq(schema.products.id, id)),
    db
      .select({ id: schema.productCategories.id, name: schema.productCategories.name })
      .from(schema.productCategories)
      .orderBy(asc(schema.productCategories.position)),
    db
      .select({ id: schema.programs.id, title: schema.programs.title })
      .from(schema.programs)
      .orderBy(asc(schema.programs.position)),
    db
      .select({
        id: schema.entrepreneurs.id,
        name: schema.entrepreneurs.name,
        isFoundation: schema.entrepreneurs.isFoundation,
      })
      .from(schema.entrepreneurs)
      .orderBy(asc(schema.entrepreneurs.position)),
  ])
  if (!product) notFound()

  return (
    <AdminPage title={product.name} back={{ href: '/admin/produits', label: 'Produits' }}>
      <ProductForm
        product={product}
        categories={categories}
        programs={programs}
        entrepreneurs={entrepreneurs}
      />
    </AdminPage>
  )
}
