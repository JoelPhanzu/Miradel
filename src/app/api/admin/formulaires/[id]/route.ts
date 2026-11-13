import { asc, eq } from 'drizzle-orm'
import { getDb, schema } from '@/db'
import type { FormFieldDef } from '@/db/schema'
import { MESSAGE_STATUS_LABELS } from '@/lib/admin/labels'
import { getCurrentUser } from '@/lib/auth/session'
import { csvResponse } from '@/lib/csv'
import { kinshasaDateString } from '@/lib/dates'
import { formatDateTime } from '@/lib/format'
import { answerText } from '@/lib/program-forms'
import { slugify } from '@/lib/slug'

/** Export CSV des réponses d'un formulaire (une colonne par question). */
export async function GET(
  _request: Request,
  { params }: RouteContext<'/api/admin/formulaires/[id]'>,
) {
  const user = await getCurrentUser()
  if (!user) return new Response('Connexion requise', { status: 401 })
  const { id } = await params
  const db = getDb()
  const [form] = await db.select().from(schema.programForms).where(eq(schema.programForms.id, id))
  if (!form) return new Response('Formulaire introuvable', { status: 404 })
  const responses = await db
    .select()
    .from(schema.programFormResponses)
    .where(eq(schema.programFormResponses.formId, id))
    .orderBy(asc(schema.programFormResponses.createdAt))

  // Questions actuelles, puis questions retirées depuis mais présentes dans d'anciennes réponses.
  const columns: FormFieldDef[] = [...form.fields]
  for (const r of responses) {
    for (const f of r.fields) if (!columns.some((c) => c.id === f.id)) columns.push(f)
  }
  const rows = [
    ['Date', 'Statut', ...columns.map((c) => c.label)],
    ...responses.map((r) => [
      formatDateTime(r.createdAt),
      MESSAGE_STATUS_LABELS[r.status],
      ...columns.map((c) => answerText(r.answers[c.id])),
    ]),
  ]
  return csvResponse(rows, `reponses-${slugify(form.title)}-${kinshasaDateString(new Date())}.csv`)
}
