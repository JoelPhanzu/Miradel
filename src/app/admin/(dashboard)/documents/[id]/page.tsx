import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { DocumentField } from '@/components/admin/DocumentField'
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
import { DOCUMENT_TYPES } from '@/db/schema'
import { DOCUMENT_TYPE_LABELS } from '@/lib/admin/labels'
import { requireUser } from '@/lib/auth/session'
import { deleteDocument, saveDocument } from '../actions'

/** /admin/documents/nouveau ou /admin/documents/<id> */
export default async function DocumentPage({ params }: PageProps<'/admin/documents/[id]'>) {
  await requireUser()
  const { id } = await params
  const isNew = id === 'nouveau'
  const [doc] = isNew
    ? [undefined]
    : await getDb().select().from(schema.documents).where(eq(schema.documents.id, id))
  if (!isNew && !doc) notFound()

  return (
    <AdminPage
      title={doc?.title ?? 'Nouveau document'}
      back={{ href: '/admin/documents', label: 'Documents' }}
    >
      <AdminForm
        action={saveDocument.bind(null, doc?.id ?? null)}
        submitLabel={doc ? 'Enregistrer' : 'Ajouter le document'}
        redirectBase="/admin/documents"
      >
        <FormSection title="Affichage">
          <ToggleField
            name="isPublished"
            label="Publier sur la page Transparence"
            defaultChecked={doc?.isPublished ?? true}
          />
        </FormSection>
        <FormSection title="Document">
          <DocumentField defaultUrl={doc?.fileUrl} defaultSize={doc?.fileSizeBytes} />
          <TextField
            name="title"
            label="Titre"
            defaultValue={doc?.title}
            hint="Ex. « Rapport d’activité 2025 »"
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <SelectField
              name="type"
              label="Type"
              defaultValue={doc?.type ?? 'rapport_activite'}
              options={DOCUMENT_TYPES.map((t) => ({ value: t, label: DOCUMENT_TYPE_LABELS[t] }))}
            />
            <TextField name="year" label="Année" inputMode="numeric" defaultValue={doc?.year} />
          </div>
          <TextAreaField
            name="description"
            label="Description (facultative)"
            defaultValue={doc?.description}
            rows={2}
          />
        </FormSection>
      </AdminForm>
      {doc && (
        <DeleteButton
          action={deleteDocument.bind(null, doc.id)}
          redirectTo="/admin/documents"
          label="Supprimer le document"
        />
      )}
    </AdminPage>
  )
}
