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
import { deleteMetric, saveMetric } from '../actions'

/** /admin/impact/nouveau ou /admin/impact/<id> */
export default async function MetricPage({ params }: PageProps<'/admin/impact/[id]'>) {
  await requireUser()
  const { id } = await params
  const isNew = id === 'nouveau'
  const db = getDb()
  const [[metric], programs] = await Promise.all([
    isNew
      ? Promise.resolve([undefined])
      : db.select().from(schema.impactMetrics).where(eq(schema.impactMetrics.id, id)),
    db
      .select({ id: schema.programs.id, title: schema.programs.title })
      .from(schema.programs)
      .orderBy(asc(schema.programs.position)),
  ])
  if (!isNew && !metric) notFound()

  return (
    <AdminPage
      title={metric?.label ?? 'Nouveau chiffre'}
      back={{ href: '/admin/impact', label: 'Chiffres d’impact' }}
    >
      <AdminForm
        action={saveMetric.bind(null, metric?.id ?? null)}
        submitLabel={metric ? 'Enregistrer' : 'Ajouter le chiffre'}
        redirectBase="/admin/impact"
      >
        <FormSection title="Affichage">
          <ToggleField
            name="isPublished"
            label="Publier sur le site"
            defaultChecked={metric?.isPublished ?? false}
          />
        </FormSection>
        <FormSection title="Chiffre">
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              name="value"
              label="Valeur"
              inputMode="numeric"
              defaultValue={metric?.value}
              hint="Un nombre entier, ex. 120"
            />
            <TextField
              name="unit"
              label="Unité (facultative)"
              defaultValue={metric?.unit}
              hint="Ex. « ha », « % »"
            />
          </div>
          <TextField
            name="label"
            label="Ce qui est compté"
            defaultValue={metric?.label}
            hint="Ex. « femmes formées », « consultations dans les cliniques mobiles »"
          />
          <TextField
            name="period"
            label="Période ou date de référence"
            defaultValue={metric?.period}
            hint="Ex. « en 2025 », « depuis 2022 »"
          />
          <SelectField
            name="programId"
            label="Programme concerné"
            defaultValue={metric?.programId}
            emptyLabel="Toute la fondation"
            options={programs.map((p) => ({ value: p.id, label: p.title }))}
          />
        </FormSection>
        <FormSection title="Justification (interne, jamais affichée)">
          <TextAreaField
            name="source"
            label="Source du chiffre"
            defaultValue={metric?.source}
            rows={3}
            hint="Ex. « Listes de présence des formations 2025, classeur au siège »."
          />
        </FormSection>
      </AdminForm>
      {metric && (
        <DeleteButton
          action={deleteMetric.bind(null, metric.id)}
          redirectTo="/admin/impact"
          label="Supprimer le chiffre"
        />
      )}
    </AdminPage>
  )
}
