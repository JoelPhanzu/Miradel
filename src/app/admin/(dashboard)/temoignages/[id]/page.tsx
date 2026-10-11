import { asc, eq } from 'drizzle-orm'
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
import { deleteTestimonial, saveTestimonial } from '../actions'

/** /admin/temoignages/nouveau ou /admin/temoignages/<id> */
export default async function TestimonialPage({ params }: PageProps<'/admin/temoignages/[id]'>) {
  await requireUser()
  const { id } = await params
  const db = getDb()
  const isNew = id === 'nouveau'
  const [[item], programs] = await Promise.all([
    isNew
      ? Promise.resolve([undefined])
      : db.select().from(schema.testimonials).where(eq(schema.testimonials.id, id)),
    db
      .select({ id: schema.programs.id, title: schema.programs.title })
      .from(schema.programs)
      .orderBy(asc(schema.programs.position)),
  ])
  if (!isNew && !item) notFound()

  return (
    <AdminPage
      title={item?.displayName ?? 'Nouveau témoignage'}
      back={{ href: '/admin/temoignages', label: 'Témoignages' }}
    >
      <AdminForm
        action={saveTestimonial.bind(null, item?.id ?? null)}
        submitLabel={item ? 'Enregistrer' : 'Ajouter le témoignage'}
        redirectBase={`/admin/temoignages`}
      >
        <FormSection title="Accord de la personne">
          <ToggleField
            name="consentObtained"
            label="La personne a accepté que son témoignage soit publié"
            description="Obligatoire pour publier. Pour un mineur : accord d’un parent ou tuteur. Gardez une trace écrite."
            defaultChecked={item?.consentObtained ?? false}
          />
          <ToggleField
            name="isPublished"
            label="Publier sur le site"
            defaultChecked={item?.isPublished ?? false}
          />
        </FormSection>
        <FormSection title="Témoignage">
          <TextField
            name="displayName"
            label="Nom affiché"
            defaultValue={item?.displayName}
            hint="Prénom et initiale, ou ce que la personne a accepté d’afficher."
          />
          <TextAreaField
            name="body"
            label="Texte du témoignage"
            defaultValue={item?.body}
            hint="Court : 2 ou 3 lignes."
          />
          <SelectField
            name="programId"
            label="Programme"
            defaultValue={item?.programId}
            emptyLabel="Aucun"
            options={programs.map((p) => ({ value: p.id, label: p.title }))}
          />
        </FormSection>
      </AdminForm>
      {item && (
        <DeleteButton
          action={deleteTestimonial.bind(null, item.id)}
          redirectTo="/admin/temoignages"
          label="Supprimer le témoignage"
        />
      )}
    </AdminPage>
  )
}
