import type { Metadata } from 'next'
import { AdminForm, FormSection, TextField } from '@/components/admin/form'
import { AdminPage } from '@/components/admin/ui'
import { requireUser } from '@/lib/auth/session'
import { saveMyAccount } from '../utilisateurs/actions'

export const metadata: Metadata = { title: 'Mon compte' }

export default async function AccountPage() {
  const user = await requireUser()
  return (
    <AdminPage title="Mon compte" description={user.email}>
      <AdminForm action={saveMyAccount}>
        <FormSection title="Mon nom">
          <TextField name="fullName" label="Nom" defaultValue={user.fullName} />
        </FormSection>
        <FormSection title="Changer de mot de passe">
          <TextField
            name="currentPassword"
            label="Mot de passe actuel"
            type="password"
            autoComplete="current-password"
          />
          <TextField
            name="newPassword"
            label="Nouveau mot de passe"
            type="password"
            autoComplete="new-password"
            hint="10 caractères minimum. Laissez vide pour ne pas le changer."
          />
        </FormSection>
      </AdminForm>
    </AdminPage>
  )
}
