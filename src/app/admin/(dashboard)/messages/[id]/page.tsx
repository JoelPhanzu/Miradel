import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { EnvelopeSimple, WhatsappLogo } from '@phosphor-icons/react/ssr'
import { AdminForm, DeleteButton, TextAreaField } from '@/components/admin/form'
import { StatusButtons } from '@/components/admin/StatusButtons'
import { AdminPage } from '@/components/admin/ui'
import { getDb, schema } from '@/db'
import { MESSAGE_STATUSES } from '@/db/schema'
import { MESSAGE_KIND_LABELS, MESSAGE_STATUS_LABELS } from '@/lib/admin/labels'
import { requireUser } from '@/lib/auth/session'
import { getSiteSettings } from '@/lib/data/public'
import { formatDateTime, formatPhone } from '@/lib/format'
import { buildWhatsAppUrl } from '@/lib/whatsapp'
import { deleteMessage, saveMessageNote, setMessageStatus } from '../actions'

export default async function MessagePage({ params }: PageProps<'/admin/messages/[id]'>) {
  await requireUser()
  const { id } = await params
  const [[m], settings] = await Promise.all([
    getDb().select().from(schema.contactMessages).where(eq(schema.contactMessages.id, id)),
    getSiteSettings(),
  ])
  if (!m) notFound()

  const greeting = `Bonjour ${m.fullName}, ici la ${settings.organizationName}, suite à votre message. `

  return (
    <AdminPage
      title={m.fullName}
      description={`${MESSAGE_KIND_LABELS[m.kind]} - reçu le ${formatDateTime(m.createdAt)}`}
      back={{ href: '/admin/messages', label: 'Messages' }}
    >
      <div className="grid gap-8">
        <div className="bg-cream-deep rounded-3xl p-5">
          {m.organization && <p className="font-semibold">{m.organization}</p>}
          {m.phone && <p className="text-ink-soft">{formatPhone(m.phone)}</p>}
          {m.email && <p className="text-ink-soft break-all">{m.email}</p>}
          <p className="mt-4 whitespace-pre-line">{m.message}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {m.phone && (
              <a
                href={buildWhatsAppUrl(m.phone, greeting)}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-whatsapp inline-flex min-h-12 items-center gap-2 rounded-full px-5 text-sm font-semibold text-white dark:text-[#10261a]"
              >
                <WhatsappLogo size={18} weight="fill" aria-hidden />
                Répondre sur WhatsApp
              </a>
            )}
            {m.email && (
              <a
                href={`mailto:${m.email}?subject=${encodeURIComponent(settings.organizationName)}`}
                className="border-ink/40 inline-flex min-h-12 items-center gap-2 rounded-full border px-5 text-sm font-semibold"
              >
                <EnvelopeSimple size={18} aria-hidden />
                Répondre par e-mail
              </a>
            )}
          </div>
        </div>

        <section>
          <h2 className="mb-3 font-semibold">Statut</h2>
          <StatusButtons
            statuses={MESSAGE_STATUSES}
            current={m.status}
            labels={MESSAGE_STATUS_LABELS}
            onChange={setMessageStatus.bind(null, m.id)}
          />
        </section>

        <section>
          <h2 className="font-display mb-4 text-2xl font-semibold">Note interne</h2>
          <AdminForm action={saveMessageNote.bind(null, m.id)}>
            <TextAreaField
              name="internalNote"
              label="Suivi (visible uniquement par l’équipe)"
              defaultValue={m.internalNote}
              rows={3}
            />
          </AdminForm>
        </section>

        <DeleteButton
          action={deleteMessage.bind(null, m.id)}
          redirectTo="/admin/messages"
          label="Supprimer le message"
        />
      </div>
    </AdminPage>
  )
}
