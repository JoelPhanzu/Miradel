import { desc, eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { DownloadSimple, WhatsappLogo } from '@phosphor-icons/react/ssr'
import { DeleteButton } from '@/components/admin/form'
import { StatusButtons } from '@/components/admin/StatusButtons'
import { AdminPage, Badge, EmptyState } from '@/components/admin/ui'
import { getDb, schema } from '@/db'
import { MESSAGE_STATUSES } from '@/db/schema'
import { MESSAGE_STATUS_LABELS, MESSAGE_TONES } from '@/lib/admin/labels'
import { requireUser } from '@/lib/auth/session'
import { getSiteSettings } from '@/lib/data/public'
import { formatDateTime } from '@/lib/format'
import { answerText, findName, findPhone } from '@/lib/program-forms'
import { buildWhatsAppUrl } from '@/lib/whatsapp'
import { deleteResponse, setResponseStatus } from '../../actions'

export default async function ResponsesPage({
  params,
}: PageProps<'/admin/formulaires/[id]/reponses'>) {
  await requireUser()
  const { id } = await params
  const db = getDb()
  const [[form], responses, settings] = await Promise.all([
    db.select().from(schema.programForms).where(eq(schema.programForms.id, id)),
    db
      .select()
      .from(schema.programFormResponses)
      .where(eq(schema.programFormResponses.formId, id))
      .orderBy(desc(schema.programFormResponses.createdAt)),
    getSiteSettings(),
  ])
  if (!form) notFound()

  return (
    <AdminPage
      title="Réponses"
      description={form.title}
      back={{ href: `/admin/formulaires/${form.id}`, label: 'Formulaire' }}
    >
      {responses.length > 0 && (
        <a
          href={`/api/admin/formulaires/${form.id}`}
          className="border-ink/40 mb-6 inline-flex min-h-12 items-center gap-2 rounded-full border px-5 text-sm font-semibold"
        >
          <DownloadSimple size={18} aria-hidden />
          Télécharger (Excel / CSV)
        </a>
      )}
      {responses.length === 0 ? (
        <EmptyState>Aucune réponse pour le moment.</EmptyState>
      ) : (
        <ul className="grid gap-6">
          {responses.map((r) => {
            const phone = findPhone(r.fields, r.answers)
            const name = findName(r.fields, r.answers)
            const greeting = `Bonjour${name ? ` ${name}` : ''}, ici la ${settings.organizationName}, au sujet de votre inscription : ${form.title}. `
            return (
              <li key={r.id} className="border-line grid gap-4 rounded-3xl border p-4 md:p-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold">{name ?? 'Réponse'}</p>
                  <span className="flex items-center gap-2 text-sm">
                    <Badge tone={MESSAGE_TONES[r.status]}>{MESSAGE_STATUS_LABELS[r.status]}</Badge>
                    <span className="text-ink-soft">{formatDateTime(r.createdAt)}</span>
                  </span>
                </div>
                <dl className="grid gap-3">
                  {r.fields.map((f) => (
                    <div key={f.id}>
                      <dt className="text-ink-soft text-sm">{f.label}</dt>
                      <dd className="whitespace-pre-line">{answerText(r.answers[f.id]) || '—'}</dd>
                    </div>
                  ))}
                </dl>
                {phone && (
                  <a
                    href={buildWhatsAppUrl(phone, greeting)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-whatsapp inline-flex min-h-12 w-fit items-center gap-2 rounded-full px-5 text-sm font-semibold text-navy-950"
                  >
                    <WhatsappLogo size={18} weight="fill" aria-hidden />
                    Répondre sur WhatsApp
                  </a>
                )}
                <StatusButtons
                  statuses={MESSAGE_STATUSES}
                  current={r.status}
                  labels={MESSAGE_STATUS_LABELS}
                  onChange={setResponseStatus.bind(null, r.id)}
                />
                <DeleteButton
                  action={deleteResponse.bind(null, r.id)}
                  redirectTo={`/admin/formulaires/${form.id}/reponses`}
                  label="Supprimer cette réponse"
                />
              </li>
            )
          })}
        </ul>
      )}
    </AdminPage>
  )
}
