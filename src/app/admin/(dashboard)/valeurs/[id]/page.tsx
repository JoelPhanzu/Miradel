import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import {
  AdminForm,
  DeleteButton,
  FormSection,
  SelectField,
  TextAreaField,
  TextField,
  ToggleField,
} from '@/components/admin/form'
import { AdminPage } from '@/components/admin/ui'
import { getDb, schema } from '@/db'
import { requireUser } from '@/lib/auth/session'
import { deleteValue, saveValue } from '../actions'

/** /admin/valeurs/nouveau ou /admin/valeurs/<id> */
export default async function ValuePage({ params }: PageProps<'/admin/valeurs/[id]'>) {
  await requireUser()
  const { id } = await params
  const isNew = id === 'nouveau'
  const [value] = isNew
    ? [undefined]
    : await getDb()
        .select()
        .from(schema.organizationValues)
        .where(eq(schema.organizationValues.id, id))
  if (!isNew && !value) notFound()

  return (
    <AdminPage
      title={value?.title ?? 'Nouvelle valeur ou nouveau principe'}
      back={{ href: '/admin/valeurs', label: 'Valeurs et principes' }}
    >
      <AdminForm
        action={saveValue.bind(null, value?.id ?? null)}
        submitLabel={value ? 'Enregistrer' : 'Ajouter'}
        redirectBase="/admin/valeurs"
      >
        <FormSection title="Affichage">
          <ToggleField
            name="isPublished"
            label="Afficher sur le site"
            defaultChecked={value?.isPublished ?? true}
          />
        </FormSection>
        <FormSection title="Contenu">
          <SelectField
            name="kind"
            label="Type"
            defaultValue={value?.kind ?? 'valeur'}
            options={[
              { value: 'valeur', label: 'Valeur (ce en quoi nous croyons)' },
              { value: 'principe', label: 'Principe d’action (notre manière d’agir)' },
            ]}
          />
          <TextField
            name="title"
            label="Intitulé"
            defaultValue={value?.title}
            hint="Un ou quelques mots, tels que la fondation les formule."
          />
          <TextAreaField
            name="description"
            label="Explication (facultatif)"
            defaultValue={value?.description}
            rows={3}
          />
        </FormSection>
      </AdminForm>
      {value && (
        <DeleteButton
          action={deleteValue.bind(null, value.id)}
          redirectTo="/admin/valeurs"
          label="Supprimer"
        />
      )}
    </AdminPage>
  )
}
