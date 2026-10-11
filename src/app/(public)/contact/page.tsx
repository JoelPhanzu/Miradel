import type { Metadata } from 'next'
import { EnvelopeSimple, MapPin, Phone, WhatsappLogo } from '@phosphor-icons/react/ssr'
import { ButtonLink } from '@/components/public/ButtonLink'
import { MessageForm } from '@/components/public/form/MessageForm'
import { PageHeader } from '@/components/public/PageHeader'
import { ToCompleteMark } from '@/components/public/ToComplete'
import { getPageSections, getSiteSettings } from '@/lib/data/public'
import { formatPhone } from '@/lib/format'
import { buildWhatsAppUrl } from '@/lib/whatsapp'

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Téléphone, WhatsApp, e-mail et formulaire de contact de la Fondation MIRADEL FEVEPA.',
}

export default async function ContactPage() {
  const [settings, { contact_intro: intro }] = await Promise.all([
    getSiteSettings(),
    getPageSections(),
  ])

  const row = 'flex items-start gap-4 py-5'
  return (
    <>
      <PageHeader title={intro?.title ?? 'Contact'} intro={intro?.body} />
      <div className="mx-auto grid max-w-[1320px] gap-14 px-4 pb-24 md:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div>
          <ul className="divide-line border-line divide-y border-y text-lg">
            <li className={row}>
              <MapPin size={24} className="text-accent mt-0.5 shrink-0" aria-hidden />
              <div>
                <p className="text-ink-soft text-sm font-semibold">Siège</p>
                {settings.address ? <p>{settings.address}</p> : <ToCompleteMark />}
                {settings.googleMapsUrl && (
                  <a
                    href={settings.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent text-sm font-semibold underline underline-offset-4"
                  >
                    Voir l&apos;itinéraire
                  </a>
                )}
              </div>
            </li>
            {settings.phone && (
              <li className={row}>
                <Phone size={24} className="text-accent mt-0.5 shrink-0" aria-hidden />
                <a href={`tel:${settings.phone}`} className="hover:text-accent">
                  {formatPhone(settings.phone)}
                </a>
              </li>
            )}
            {settings.emails.length > 0 && (
              <li className={row}>
                <EnvelopeSimple size={24} className="text-accent mt-0.5 shrink-0" aria-hidden />
                <div className="grid gap-1">
                  {settings.emails.map((email) => (
                    <a key={email} href={`mailto:${email}`} className="hover:text-accent break-all">
                      {email}
                    </a>
                  ))}
                </div>
              </li>
            )}
          </ul>

          <div className="mt-10">
            <ButtonLink
              href={buildWhatsAppUrl(
                settings.whatsappNumber,
                `Bonjour ${settings.organizationName}, je souhaite un renseignement.`,
              )}
              target="_blank"
              rel="noopener noreferrer"
              variant="whatsapp"
            >
              <WhatsappLogo size={18} weight="fill" aria-hidden />
              Écrire sur WhatsApp
            </ButtonLink>
          </div>
        </div>

        <section aria-labelledby="contact-form-title">
          <h2 id="contact-form-title" className="font-display text-3xl font-medium">
            Nous écrire
          </h2>
          <div className="mt-6">
            <MessageForm kind="contact" />
          </div>
        </section>
      </div>
    </>
  )
}
