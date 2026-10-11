import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import {
  AdminForm,
  DeleteButton,
  FormSection,
  ImageField,
  TextField,
  ToggleField,
} from '@/components/admin/form'
import { AdminPage } from '@/components/admin/ui'
import { getDb, schema } from '@/db'
import { requireUser } from '@/lib/auth/session'
import { deletePartner, savePartner } from '../actions'

/** /admin/partenaires/nouveau ou /admin/partenaires/<id> */
export default async function PartnerPage({ params }: PageProps<'/admin/partenaires/[id]'>) {
  await requireUser()
  const { id } = await params
  const isNew = id === 'nouveau'
  const [partner] = isNew
    ? [undefined]
    : await getDb().select().from(schema.partners).where(eq(schema.partners.id, id))
  if (!isNew && !partner) notFound()

  return (
    <AdminPage
      title={partner?.name ?? 'Nouveau partenaire'}
      back={{ href: '/admin/partenaires', label: 'Partenaires' }}
    >
      <AdminForm
        action={savePartner.bind(null, partner?.id ?? null)}
        submitLabel={partner ? 'Enregistrer' : 'Ajouter le partenaire'}
        redirectBase="/admin/partenaires"
      >
        <FormSection title="Affichage">
          <ToggleField
            name="isPublished"
            label="Afficher sur le site"
            defaultChecked={partner?.isPublished ?? true}
          />
        </FormSection>
        <FormSection title="Partenaire">
          <TextField name="name" label="Nom" defaultValue={partner?.name} />
          <TextField
            name="websiteUrl"
            label="Site internet (facultatif)"
            type="url"
            defaultValue={partner?.websiteUrl}
          />
          <ImageField
            name="logoUrl"
            label="Logo"
            defaultValue={partner?.logoUrl}
            aspect="aspect-[3/2]"
            hint="Logo fourni par le partenaire, sur fond clair de préférence."
          />
        </FormSection>
      </AdminForm>
      {partner && (
        <DeleteButton
          action={deletePartner.bind(null, partner.id)}
          redirectTo="/admin/partenaires"
          label="Retirer le partenaire"
        />
      )}
    </AdminPage>
  )
}
