import Link from 'next/link'
import {
  FacebookLogo,
  InstagramLogo,
  LinkedinLogo,
  TiktokLogo,
  WhatsappLogo,
  XLogo,
  YoutubeLogo,
} from '@phosphor-icons/react/ssr'
import { getSiteSettings } from '@/lib/data/public'
import { formatPhone } from '@/lib/format'
import { buildWhatsAppUrl } from '@/lib/whatsapp'
import { NewsletterForm } from './form/NewsletterForm'
import { Logo } from './Logo'
import { NAV_LINKS } from './nav'

const SOCIAL_ICONS = {
  facebook: { label: 'Facebook', Icon: FacebookLogo },
  instagram: { label: 'Instagram', Icon: InstagramLogo },
  tiktok: { label: 'TikTok', Icon: TiktokLogo },
  youtube: { label: 'YouTube', Icon: YoutubeLogo },
  linkedin: { label: 'LinkedIn', Icon: LinkedinLogo },
  x: { label: 'X', Icon: XLogo },
} as const

export async function Footer() {
  const settings = await getSiteSettings()
  const socials = (Object.keys(SOCIAL_ICONS) as (keyof typeof SOCIAL_ICONS)[]).filter(
    (key) => settings.socialLinks[key],
  )

  return (
    <footer className="border-line border-t">
      <div className="mx-auto grid max-w-[1320px] gap-12 px-4 py-14 md:px-8 lg:grid-cols-[1.2fr_0.8fr_1fr_1.3fr]">
        <div>
          <Logo />
          {settings.tagline && (
            <p className="text-ink-soft mt-5 max-w-[34ch] text-sm">{settings.tagline}</p>
          )}
          <div className="mt-6 flex flex-wrap gap-2">
            <a
              href={buildWhatsAppUrl(settings.whatsappNumber)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="border-line hover:border-ink flex size-11 items-center justify-center rounded-full border"
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
                  className="border-line hover:border-ink flex size-11 items-center justify-center rounded-full border"
                >
                  <Icon size={20} aria-hidden />
                </a>
              )
            })}
          </div>
        </div>

        <nav aria-label="Pied de page">
          <ul className="grid gap-2 text-sm">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-ink-soft hover:text-ink">
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/sengager" className="text-ink-soft hover:text-ink">
                S’engager
              </Link>
            </li>
          </ul>
        </nav>

        <div className="grid content-start gap-2 text-sm">
          <p className="font-semibold">{settings.organizationName}</p>
          {settings.legalStatus && <p className="text-ink-soft">{settings.legalStatus}</p>}
          {settings.address && <p className="text-ink-soft max-w-[28ch]">{settings.address}</p>}
          {settings.phone && (
            <a href={`tel:${settings.phone}`} className="text-ink-soft hover:text-ink">
              {formatPhone(settings.phone)}
            </a>
          )}
          {settings.emails.map((email) => (
            <a
              key={email}
              href={`mailto:${email}`}
              className="text-ink-soft hover:text-ink break-all"
            >
              {email}
            </a>
          ))}
        </div>

        <NewsletterForm />
      </div>
      <div className="text-ink-soft mx-auto flex max-w-[1320px] flex-wrap justify-between gap-4 px-4 pb-24 text-xs md:px-8 md:pb-8">
        <p>© {settings.organizationName}</p>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <Link href="/conditions-generales" className="hover:text-ink">
            Conditions générales
          </Link>
          <Link href="/politique-de-confidentialite" className="hover:text-ink">
            Politique de confidentialité
          </Link>
          <p>
            by <span className="text-ink font-semibold">Lean Market</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
