import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import {
  AdminForm,
  DeleteButton,
  ImageField,
  TextAreaField,
  TextField,
} from '@/components/admin/form'
import { AdminPage } from '@/components/admin/ui'
import { getDb, schema } from '@/db'
import { requireUser } from '@/lib/auth/session'
import { deleteCategory, saveCategory } from '../actions'

/** /admin/categories/nouveau ou /admin/categories/<id> */
export default async function CategoryPage({ params }: PageProps<'/admin/categories/[id]'>) {
  await requireUser()
  const { id } = await params
  const isNew = id === 'nouveau'
  const [category] = isNew
    ? [undefined]
    : await getDb()
        .select()
        .from(schema.productCategories)
        .where(eq(schema.productCategories.id, id))
  if (!isNew && !category) notFound()

  return (
    <AdminPage
      title={category?.name ?? 'Nouvelle catégorie'}
      back={{ href: '/admin/categories', label: 'Catégories' }}
    >
      <AdminForm
        action={saveCategory.bind(null, category?.id ?? null)}
        submitLabel={category ? 'Enregistrer' : 'Créer la catégorie'}
        redirectBase="/admin/categories"
      >
        <TextField name="name" label="Nom" defaultValue={category?.name} />
        <TextAreaField
          name="description"
          label="Description (facultative)"
          defaultValue={category?.description}
          rows={3}
        />
        <ImageField
          name="imageUrl"
          label="Image (facultative)"
          defaultValue={category?.imageUrl}
          hint="Sinon, la photo du premier produit de la catégorie est utilisée."
        />
      </AdminForm>
      {category && (
        <DeleteButton
          action={deleteCategory.bind(null, category.id)}
          redirectTo="/admin/categories"
          label="Supprimer la catégorie"
        />
      )}
    </AdminPage>
  )
}
