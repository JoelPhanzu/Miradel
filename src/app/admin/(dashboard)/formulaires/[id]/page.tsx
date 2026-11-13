import Link from 'next/link'
import { asc, count, eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { ListChecks } from '@phosphor-icons/react/ssr'
import {
  AdminForm,
  DeleteButton,
  FormSection,
  SelectField,
  TextAreaField,
  TextField,
  ToggleField,
} from '@/components/admin/form'
import { FormFieldsBuilder } from '@/components/admin/FormFieldsBuilder'
import { AdminPage } from '@/components/admin/ui'
import { getDb, schema } from '@/db'
import { toKinshasaLocal } from '@/lib/admin/kinshasa-time'
import { requireUser } from '@/lib/auth/session'
import { starterFields } from '@/lib/program-forms'
import { deleteProgramForm, saveProgramForm } from '../actions'

/** /admin/formulaires/nouveau ou /admin/formulaires/<id> */
export default async function ProgramFormPage({ params }: PageProps<'/admin/formulaires/[id]'>) {
  await requireUser()
  const { id } = await params
  const isNew = id === 'nouveau'
  const db = getDb()
  const [forms, programs, responseCount] = await Promise.all([
    isNew ? [] : db.select().from(schema.programForms).where(eq(schema.programForms.id, id)),
    db
      .select({ id: schema.programs.id, title: schema.programs.title })
      .from(schema.programs)
      .orderBy(asc(schema.programs.position)),
    isNew
      ? [{ n: 0 }]
      : db
          .select({ n: count() })
          .from(schema.programFormResponses)
          .where(eq(schema.programFormResponses.formId, id)),
  ])
  const form = forms[0]
  if (!isNew && !form) notFound()

  return (
    <AdminPage
      title={form?.title ?? 'Nouveau formulaire'}
      back={{ href: '/admin/formulaires', label: 'Formulaires' }}
    >
      {form && (
        <Link
          href={`/admin/formulaires/${form.id}/reponses`}
          className="bg-cream-deep mb-6 flex min-h-14 items-center gap-3 rounded-2xl px-4 font-semibold"
        >
          <ListChecks size={22} aria-hidden />
          Voir les réponses ({Number(responseCount[0]?.n ?? 0)})
        </Link>
      )}
      <AdminForm
        action={saveProgramForm.bind(null, form?.id ?? null)}
        submitLabel={form ? 'Enregistrer' : 'Créer le formulaire'}
        redirectBase="/admin/formulaires"
      >
        <FormSection title="Affichage">
          <ToggleField
            name="isPublished"
            label="Afficher sur la page du programme"
            description="Le formulaire n’apparaît qu’avant la date limite."
            defaultChecked={form?.isPublished ?? false}
          />
          <TextField
            name="closesAt"
            label="Date et heure limites (heure de Kinshasa)"
            type="datetime-local"
            defaultValue={toKinshasaLocal(form?.closesAt)}
            hint="Après ce moment, le formulaire n’est plus accessible et les envois sont refusés."
          />
        </FormSection>
        <FormSection title="Présentation">
          <SelectField
            name="programId"
            label="Programme"
            defaultValue={form?.programId}
            emptyLabel="Choisir…"
            options={programs.map((p) => ({ value: p.id, label: p.title }))}
          />
          <TextField
            name="title"
            label="Titre"
            defaultValue={form?.title}
            hint="Ex. « Inscription à la formation en couture, session de janvier »"
          />
          <TextAreaField
            name="intro"
            label="Explication (facultatif)"
            defaultValue={form?.intro}
            hint="Qui peut participer, déroulement, lieu… Paragraphes séparés par une ligne vide."
          />
          <TextField
            name="successMessage"
            label="Message de remerciement (facultatif)"
            defaultValue={form?.successMessage}
            hint="Affiché après l’envoi. Par défaut : « Merci, votre participation a bien été enregistrée. »"
          />
        </FormSection>
        <FormSection title="Questions">
          <FormFieldsBuilder defaultValue={form?.fields ?? starterFields()} />
        </FormSection>
      </AdminForm>
      {form && (
        <DeleteButton
          action={deleteProgramForm.bind(null, form.id)}
          redirectTo="/admin/formulaires"
          label="Supprimer le formulaire et ses réponses"
        />
      )}
    </AdminPage>
  )
}
