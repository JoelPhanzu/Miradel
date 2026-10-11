import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import {
  AdminForm,
  DeleteButton,
  FormSection,
  ImageField,
  TextAreaField,
  TextField,
  ToggleField,
} from '@/components/admin/form'
import { AdminPage } from '@/components/admin/ui'
import { getDb, schema } from '@/db'
import { requireUser } from '@/lib/auth/session'
import { deleteMember, saveMember } from '../actions'

/** /admin/equipe/nouveau ou /admin/equipe/<id> */
export default async function MemberPage({ params }: PageProps<'/admin/equipe/[id]'>) {
  await requireUser()
  const { id } = await params
  const isNew = id === 'nouveau'
  const [member] = isNew
    ? [undefined]
    : await getDb().select().from(schema.teamMembers).where(eq(schema.teamMembers.id, id))
  if (!isNew && !member) notFound()

  return (
    <AdminPage
      title={member?.fullName ?? 'Nouvelle personne'}
      back={{ href: '/admin/equipe', label: 'Équipe' }}
    >
      <AdminForm
        action={saveMember.bind(null, member?.id ?? null)}
        submitLabel={member ? 'Enregistrer' : 'Ajouter'}
        redirectBase="/admin/equipe"
      >
        <FormSection title="Affichage">
          <ToggleField
            name="isPublished"
            label="Afficher sur le site"
            description="Avec l’accord de la personne."
            defaultChecked={member?.isPublished ?? true}
          />
        </FormSection>
        <FormSection title="Personne">
          <TextField name="fullName" label="Nom complet" defaultValue={member?.fullName} />
          <TextField
            name="role"
            label="Fonction"
            defaultValue={member?.role}
            hint="Ex. « Présidente », « Coordinateur des programmes »"
          />
          <TextAreaField
            name="bio"
            label="Courte biographie (facultative)"
            defaultValue={member?.bio}
            rows={4}
          />
          <ImageField
            name="photoUrl"
            label="Photo"
            defaultValue={member?.photoUrl}
            aspect="aspect-square"
          />
        </FormSection>
      </AdminForm>
      {member && (
        <DeleteButton
          action={deleteMember.bind(null, member.id)}
          redirectTo="/admin/equipe"
          label="Retirer cette personne"
        />
      )}
    </AdminPage>
  )
}
