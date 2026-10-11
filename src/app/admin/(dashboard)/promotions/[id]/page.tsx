import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { AdminPage } from '@/components/admin/ui'
import { getDb, schema } from '@/db'
import { requireUser } from '@/lib/auth/session'
import { PromotionForm } from '../PromotionForm'

/** /admin/promotions/nouveau ou /admin/promotions/<id> */
export default async function PromotionPage({ params }: PageProps<'/admin/promotions/[id]'>) {
  await requireUser()
  const { id } = await params
  const isNew = id === 'nouveau'
  const [promotion] = isNew
    ? [undefined]
    : await getDb().select().from(schema.promotions).where(eq(schema.promotions.id, id))
  if (!isNew && !promotion) notFound()

  return (
    <AdminPage
      title={promotion?.title ?? 'Nouvelle promotion'}
      back={{ href: '/admin/promotions', label: 'Promotions' }}
    >
      <PromotionForm promotion={promotion} />
    </AdminPage>
  )
}
