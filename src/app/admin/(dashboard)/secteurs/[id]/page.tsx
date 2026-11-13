import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { AdminForm, DeleteButton, TextAreaField, TextField } from '@/components/admin/form'
import { AdminPage } from '@/components/admin/ui'
import { getDb, schema } from '@/db'
import { requireUser } from '@/lib/auth/session'
import { deleteSector, saveSector } from '../actions'

/** /admin/secteurs/nouveau ou /admin/secteurs/<id> */
export default async function SectorPage({ params }: PageProps<'/admin/secteurs/[id]'>) {
  await requireUser()
  const { id } = await params
  const isNew = id === 'nouveau'
  const [sector] = isNew
    ? [undefined]
    : await getDb().select().from(schema.sectors).where(eq(schema.sectors.id, id))
  if (!isNew && !sector) notFound()

  return (
    <AdminPage
      title={sector?.name ?? 'Nouveau secteur'}
      back={{ href: '/admin/secteurs', label: 'Secteurs' }}
    >
      <AdminForm
        action={saveSector.bind(null, sector?.id ?? null)}
        submitLabel={sector ? 'Enregistrer' : 'Créer le secteur'}
        redirectBase="/admin/secteurs"
      >
        <TextField name="name" label="Nom du secteur" defaultValue={sector?.name} />
        <TextAreaField
          name="description"
          label="Description (facultative)"
          defaultValue={sector?.description}
          rows={3}
        />
      </AdminForm>
      {sector && (
        <DeleteButton
          action={deleteSector.bind(null, sector.id)}
          redirectTo="/admin/secteurs"
          label="Supprimer le secteur"
        />
      )}
    </AdminPage>
  )
}
