import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import {
  AdminForm,
  FormSection,
  SelectField,
  TextField,
  ToggleField,
} from '@/components/admin/form'
import { AdminPage } from '@/components/admin/ui'
import { getDb, schema } from '@/db'
import { ROLE_LABELS } from '@/lib/admin/labels'
import { MANAGER_ROLES, requireUser } from '@/lib/auth/session'
import { saveUser } from '../actions'

const ROLE_HELP =
  'Responsable et Lean Market : tout l’espace, y compris les utilisateurs. Équipe : tout sauf les utilisateurs.'

/** /admin/utilisateurs/nouveau ou /admin/utilisateurs/<id> */
export default async function UserPage({ params }: PageProps<'/admin/utilisateurs/[id]'>) {
  await requireUser(MANAGER_ROLES)
  const { id } = await params
  const isNew = id === 'nouveau'
  const [user] = isNew
    ? [undefined]
    : await getDb().select().from(schema.users).where(eq(schema.users.id, id))
  if (!isNew && !user) notFound()

  return (
    <AdminPage
      title={user?.fullName ?? 'Nouvel utilisateur'}
      back={{ href: '/admin/utilisateurs', label: 'Utilisateurs' }}
    >
      <AdminForm
        action={saveUser.bind(null, user?.id ?? null)}
        submitLabel={user ? 'Enregistrer' : 'Créer le compte'}
        redirectBase={`/admin/utilisateurs`}
      >
        <FormSection title="Compte">
          <TextField name="fullName" label="Nom" defaultValue={user?.fullName} />
          <TextField
            name="email"
            label="Adresse e-mail (identifiant)"
            type="email"
            defaultValue={user?.email}
          />
          <SelectField
            name="role"
            label="Rôle"
            defaultValue={user?.role ?? 'editor'}
            hint={ROLE_HELP}
            options={Object.entries(ROLE_LABELS).map(([value, label]) => ({ value, label }))}
          />
          {user && (
            <ToggleField
              name="isActive"
              label="Compte actif"
              description="Décochez pour bloquer l'accès sans supprimer le compte."
              defaultChecked={user.isActive}
            />
          )}
        </FormSection>
        <FormSection title={user ? 'Réinitialiser le mot de passe' : 'Mot de passe'}>
          <TextField
            name="password"
            label={user ? 'Nouveau mot de passe' : 'Mot de passe provisoire'}
            type="password"
            autoComplete="new-password"
            hint={
              user
                ? 'Laissez vide pour ne pas le changer. La personne sera déconnectée de ses appareils.'
                : '10 caractères minimum. La personne pourra le changer dans « Mon compte ».'
            }
          />
        </FormSection>
      </AdminForm>
    </AdminPage>
  )
}
