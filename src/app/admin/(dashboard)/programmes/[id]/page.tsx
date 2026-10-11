import Link from 'next/link'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { ArrowSquareOut } from '@phosphor-icons/react/ssr'
import {
  AdminForm,
  DeleteButton,
  FormSection,
  ImageField,
  ImagesField,
  SelectField,
  TextAreaField,
  TextField,
  ToggleField,
} from '@/components/admin/form'
import { AdminPage } from '@/components/admin/ui'
import { getDb, schema } from '@/db'
import { PROGRAM_STATUSES } from '@/db/schema'
import { PROGRAM_STATUS_LABELS } from '@/lib/admin/labels'
import { requireUser } from '@/lib/auth/session'
import { deleteProgram, saveProgram } from '../actions'

const FORMAT_HELP =
  'Une ligne vide entre deux paragraphes. « ## » au début d’une ligne pour un titre, « - » pour une liste, **gras**.'

/** /admin/programmes/nouveau ou /admin/programmes/<id> */
export default async function ProgramPage({ params }: PageProps<'/admin/programmes/[id]'>) {
  await requireUser()
  const { id } = await params
  const isNew = id === 'nouveau'
  const [program] = isNew
    ? [undefined]
    : await getDb().select().from(schema.programs).where(eq(schema.programs.id, id))
  if (!isNew && !program) notFound()

  return (
    <AdminPage
      title={program?.title ?? 'Nouveau programme'}
      back={{ href: '/admin/programmes', label: 'Programmes' }}
    >
      {program && (
        <Link
          href={`/nos-programmes/${program.slug}`}
          target="_blank"
          className="text-accent mb-6 inline-flex min-h-11 items-center gap-2 text-sm font-semibold"
        >
          Voir sur le site
          <ArrowSquareOut size={16} aria-hidden />
        </Link>
      )}
      <AdminForm
        action={saveProgram.bind(null, program?.id ?? null)}
        submitLabel={program ? 'Enregistrer' : 'Créer le programme'}
        redirectBase="/admin/programmes"
      >
        <FormSection title="Affichage">
          <ToggleField
            name="isPublished"
            label="Publier sur le site"
            description="Décochez pour masquer le programme sans le supprimer."
            defaultChecked={program?.isPublished ?? true}
          />
          <SelectField
            name="status"
            label="État"
            defaultValue={program?.status ?? 'en_cours'}
            options={PROGRAM_STATUSES.map((s) => ({ value: s, label: PROGRAM_STATUS_LABELS[s] }))}
          />
        </FormSection>

        <FormSection title="Présentation">
          <TextField name="title" label="Nom du programme" defaultValue={program?.title} />
          <TextAreaField
            name="summary"
            label="Résumé"
            defaultValue={program?.summary}
            rows={2}
            hint="Une ou deux phrases, affichées sur la liste des programmes."
          />
          <TextField
            name="areas"
            label="Zones d’intervention"
            defaultValue={program?.areas}
            hint="Ex. provinces, territoires, communes concernés."
          />
          <TextField
            name="beneficiaries"
            label="Bénéficiaires visés"
            defaultValue={program?.beneficiaries}
          />
          <TextAreaField
            name="content"
            label="Description complète"
            defaultValue={program?.content}
            rows={14}
            hint={FORMAT_HELP}
          />
        </FormSection>

        <FormSection title="Photos">
          <ImageField
            name="coverImageUrl"
            label="Photo principale"
            defaultValue={program?.coverImageUrl}
            aspect="aspect-[4/3]"
            hint="Photo réelle, qui valorise les personnes (au travail, en réussite)."
          />
          <ImagesField name="gallery" label="Galerie" defaultValue={program?.gallery} />
          <ToggleField
            name="galleryConsent"
            label="Autorisation de diffusion obtenue"
            description="Les personnes photographiées (et un parent pour les mineurs) ont accepté. Sans cette case, la galerie n’est pas affichée."
            defaultChecked={program?.galleryConsent ?? false}
          />
        </FormSection>
      </AdminForm>

      {program && (
        <DeleteButton
          action={deleteProgram.bind(null, program.id)}
          redirectTo="/admin/programmes"
          label="Supprimer le programme"
        />
      )}
    </AdminPage>
  )
}
