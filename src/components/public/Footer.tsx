import Link from 'next/link'
import {
  EnvelopeSimple,
  FacebookLogo,
  InstagramLogo,
  LinkedinLogo,
  MapPin,
  Phone,
  Scales,
  TiktokLogo,
  WhatsappLogo,
  XLogo,
  YoutubeLogo,
} from '@phosphor-icons/react/ssr'
import { getPublishedPrograms, getSiteSettings } from '@/lib/data/public'
import { formatPhone } from '@/lib/format'
import { buildWhatsAppUrl } from '@/lib/whatsapp'
import { NewsletterForm } from './form/NewsletterForm'
import { Logo } from './Logo'
import { NAV_LINKS, PROGRAMS_HREF } from './nav'

const SOCIAL_ICONS = {
  facebook: { label: 'Facebook', Icon: FacebookLogo },
  instagram: { label: 'Instagram', Icon: InstagramLogo },
  tiktok: { label: 'TikTok', Icon: TiktokLogo },
  youtube: { label: 'YouTube', Icon: YoutubeLogo },
  linkedin: { label: 'LinkedIn', Icon: LinkedinLogo },
  x: { label: 'X', Icon: XLogo },
} as const

const column = 'min-w-0 lg:border-l lg:border-white/15 lg:pl-6 lg:first:border-l-0 lg:first:pl-0'
const heading = 'font-display text-base font-extrabold text-white'
const link = 'text-white/80 hover:text-orange-400 transition-colors break-words'

export async function Footer() {
  const [settings, programs] = await Promise.all([getSiteSettings(), getPublishedPrograms()])
  const socials = (Object.keys(SOCIAL_ICONS) as (keyof typeof SOCIAL_ICONS)[]).filter(
    (key) => settings.socialLinks[key],
  )
  const iconButton =
    'flex size-11 items-center justify-center rounded-full border border-white/25 text-white transition-colors hover:border-orange-400 hover:text-orange-400'

  return (
    <footer className="on-navy">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 md:py-16 lg:grid-cols-5 lg:gap-6">
        <div className={column}>
          <Logo onDark />
          {settings.tagline && (
            <p className="mt-5 max-w-[34ch] text-sm text-white/80">{settings.tagline}</p>
          )}
          <div className="mt-6 flex flex-wrap gap-2">
            <a
              href={buildWhatsAppUrl(settings.whatsappNumber)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className={iconButton}
            >
              <WhatsappLogo size={20} aria-hidden />
            </a>
            {socials.map((key) => {
              const { label, Icon } = SOCIAL_ICONS[key]
              return (
                <a
                  key={key}
                  href={settings.socialLinks[key]!}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className={iconButton}
                >
                  <Icon size={20} aria-hidden />
                </a>
              )
            })}
          </div>
        </div>

        <nav aria-label="Pied de page" className={column}>
          <p className={heading}>Navigation</p>
          <ul className="mt-4 grid gap-1 text-sm">
            {[...NAV_LINKS, { href: '/sengager', label: 'S’engager' }].map((l) => (
              <li key={l.href}>
                <Link href={l.href} className={`${link} inline-flex min-h-9 items-center`}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className={column}>
          <p className={heading}>Nos programmes</p>
          <ul className="mt-4 grid gap-1 text-sm">
            {programs.map((p) => (
              <li key={p.id}>
                <Link
                  href={`${PROGRAMS_HREF}/${p.slug}`}
                  className={`${link} inline-flex min-h-9 items-center`}
                >
                  {p.title}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href={PROGRAMS_HREF}
                className="inline-flex min-h-9 items-center font-semibold text-orange-400 hover:text-orange-300"
              >
                Tous les programmes
              </Link>
            </li>
          </ul>
        </div>

        <div className={column}>
          <p className={heading}>Contact</p>
          <ul className="mt-4 grid gap-3 text-sm">
            <li className="flex items-start gap-2.5">
              <Scales
                size={18}
                weight="fill"
                className="mt-0.5 shrink-0 text-orange-500"
                aria-hidden
              />
              <span className="min-w-0 text-white/80">
                <span className="block font-semibold text-white">{settings.organizationName}</span>
                {settings.legalStatus}
              </span>
            </li>
            {settings.address && (
              <li className="flex items-start gap-2.5">
                <MapPin
                  size={18}
                  weight="fill"
                  className="mt-0.5 shrink-0 text-orange-500"
                  aria-hidden
                />
                <span className="min-w-0 break-words text-white/80">{settings.address}</span>
              </li>
            )}
            {settings.phone && (
              <li className="flex items-start gap-2.5">
                <Phone
                  size={18}
                  weight="fill"
                  className="mt-0.5 shrink-0 text-orange-500"
                  aria-hidden
                />
                <a href={`tel:${settings.phone}`} className={link}>
                  {formatPhone(settings.phone)}
                </a>
              </li>
            )}
            {settings.emails.map((email) => (
              <li key={email} className="flex items-start gap-2.5">
                <EnvelopeSimple
                  size={18}
                  weight="fill"
                  className="mt-0.5 shrink-0 text-orange-500"
                  aria-hidden
                />
                <a href={`mailto:${email}`} className={`${link} min-w-0 break-all`}>
                  {email}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className={column}>
          <p className={heading}>Lettre d’information</p>
          <div className="mt-4">
            <NewsletterForm />
          </div>
        </div>
      </div>

      <div className="border-t border-white/15">
        <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-x-6 gap-y-2 px-4 pt-6 pb-28 text-xs text-white/80 sm:px-6 md:pb-8">
          <p>© {settings.organizationName}</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/conditions-generales" className="hover:text-orange-400">
              Conditions générales
            </Link>
            <Link href="/politique-de-confidentialite" className="hover:text-orange-400">
              Politique de confidentialité
            </Link>
            <p>
              by <span className="font-semibold text-white">Lean Market</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
