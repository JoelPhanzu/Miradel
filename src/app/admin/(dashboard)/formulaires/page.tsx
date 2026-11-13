import type { Metadata } from 'next'
import { asc, count, eq } from 'drizzle-orm'
import { connection } from 'next/server'
import { MoveButtons } from '@/components/admin/MoveButtons'
import { AdminPage, Badge, EmptyState, ListCard, ListRow } from '@/components/admin/ui'
import { getDb, schema } from '@/db'
import { requireUser } from '@/lib/auth/session'
import { formatDeadline } from '@/lib/dates'
import { isFormOpen } from '@/lib/program-forms'
import { moveProgramForm } from './actions'

export const metadata: Metadata = { title: 'Formulaires de participation' }

export default async function ProgramFormsAdminPage() {
  await requireUser()
  await connection()
  const db = getDb()
  const [rows, counts] = await Promise.all([
    db
      .select({ form: schema.programForms, programTitle: schema.programs.title })
      .from(schema.programForms)
      .leftJoin(schema.programs, eq(schema.programForms.programId, schema.programs.id))
      .orderBy(asc(schema.programForms.position)),
    db
      .select({ formId: schema.programFormResponses.formId, n: count() })
      .from(schema.programFormResponses)
      .where(eq(schema.programFormResponses.status, 'nouveau'))
      .groupBy(schema.programFormResponses.formId),
  ])
  const newCount = new Map(counts.map((c) => [c.formId, Number(c.n)]))
  const now = new Date()

  return (
    <AdminPage
      title="Formulaires de participation"
      description="Inscriptions aux programmes : vous choisissez les questions et la date limite. Passée cette date, le formulaire disparaît du site."
      action={{ href: '/admin/formulaires/nouveau', label: 'Créer' }}
    >
      {rows.length === 0 ? (
        <EmptyState>Aucun formulaire pour le moment.</EmptyState>
      ) : (
        <ListCard>
          {rows.map(({ form, programTitle }, i) => {
            const open = isFormOpen(form, now)
            const fresh = newCount.get(form.id) ?? 0
            const deadline = form.closesAt ? ` · jusqu’au ${formatDeadline(form.closesAt)}` : ''
            return (
              <li key={form.id} className="flex items-center pr-1">
                <div className="min-w-0 grow">
                  <ListRow
                    href={`/admin/formulaires/${form.id}`}
                    title={form.title}
                    subtitle={`${programTitle ?? 'Programme supprimé'}${deadline}`}
                    aside={
                      <>
                        {!form.isPublished ? (
                          <Badge tone="muted">Masqué</Badge>
                        ) : open ? (
                          <Badge tone="success">Ouvert</Badge>
                        ) : (
                          <Badge tone="muted">Clos</Badge>
                        )}
                        {fresh > 0 && (
                          <Badge tone="warning">
                            {fresh} nouvelle{fresh > 1 ? 's' : ''}
                          </Badge>
                        )}
                      </>
                    }
                  />
                </div>
                <MoveButtons
                  onMove={moveProgramForm.bind(null, form.id)}
                  first={i === 0}
                  last={i === rows.length - 1}
                  label={form.title}
                />
              </li>
            )
          })}
        </ListCard>
      )}
    </AdminPage>
  )
}
