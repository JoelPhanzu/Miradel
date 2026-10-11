import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { WhatsappLogo } from '@phosphor-icons/react/ssr'
import { AdminForm, TextAreaField, TextField } from '@/components/admin/form'
import { StatusButtons } from '@/components/admin/StatusButtons'
import { AdminPage } from '@/components/admin/ui'
import { getDb, schema } from '@/db'
import { DONATION_STATUSES } from '@/db/schema'
import { requireUser } from '@/lib/auth/session'
import { getSiteSettings } from '@/lib/data/public'
import { formatAmount, formatDateTime, formatPhone } from '@/lib/format'
import { DONATION_METHOD_LABELS } from '@/lib/messages'
import { buildWhatsAppUrl } from '@/lib/whatsapp'
import { saveDonationDetails, setDonationStatus } from '../actions'

export default async function DonationPage({ params }: PageProps<'/admin/dons/[id]'>) {
  await requireUser()
  const { id } = await params
  const db = getDb()
  const [[donation], settings] = await Promise.all([
    db
      .select({ donation: schema.donations, programTitle: schema.programs.title })
      .from(schema.donations)
      .leftJoin(schema.programs, eq(schema.donations.programId, schema.programs.id))
      .where(eq(schema.donations.id, id)),
    getSiteSettings(),
  ])
  if (!donation) notFound()
  const d = donation.donation

  const reply = buildWhatsAppUrl(
    d.donorPhone,
    `Bonjour${d.donorName ? ` ${d.donorName}` : ''}, ici la ${settings.organizationName} au sujet de votre don ${d.reference}. `,
  )

  return (
    <AdminPage
      title={formatAmount(d.amount, d.currency)}
      description={`${d.reference} - déclaré le ${formatDateTime(d.createdAt)}`}
      back={{ href: '/admin/dons', label: 'Dons' }}
    >
      <div className="grid gap-8">
        <div className="bg-cream-deep rounded-3xl p-5">
          <p className="font-display text-2xl font-semibold">{d.donorName ?? 'Don anonyme'}</p>
          <p className="text-ink-soft">{formatPhone(d.donorPhone)}</p>
          {d.donorEmail && <p className="text-ink-soft">{d.donorEmail}</p>}
          <p className="mt-2">Moyen : {DONATION_METHOD_LABELS[d.paymentMethod]}</p>
          {donation.programTitle && <p>Programme soutenu : {donation.programTitle}</p>}
          {d.message && <p className="mt-3 italic">« {d.message} »</p>}
          <a
            href={reply}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-whatsapp mt-5 inline-flex min-h-12 items-center gap-2 rounded-full px-5 text-sm font-semibold text-white dark:text-[#10261a]"
          >
            <WhatsappLogo size={18} weight="fill" aria-hidden />
            Répondre sur WhatsApp
          </a>
        </div>

        <section>
          <h2 className="mb-3 font-semibold">Statut</h2>
          <StatusButtons
            statuses={DONATION_STATUSES}
            current={d.status}
            onChange={setDonationStatus.bind(null, d.id)}
          />
          <p className="text-ink-soft mt-2 text-sm">
            « Confirmé » uniquement après vérification de la réception des fonds (relevé mobile
            money ou bancaire).
          </p>
        </section>

        <section>
          <h2 className="font-display mb-4 text-2xl font-semibold">Vérification et notes</h2>
          <AdminForm action={saveDonationDetails.bind(null, d.id)}>
            <TextField
              name="transactionReference"
              label="Référence de la transaction"
              defaultValue={d.transactionReference}
              hint="Indiquée par le donateur ; corrigez-la si besoin après vérification."
            />
            <TextAreaField
              name="internalNote"
              label="Note interne"
              defaultValue={d.internalNote}
              rows={3}
            />
          </AdminForm>
        </section>
      </div>
    </AdminPage>
  )
}
