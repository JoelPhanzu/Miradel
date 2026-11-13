import Link from 'next/link'
import { Suspense } from 'react'
import { EnvelopeSimple, HandHeart, Phone } from '@phosphor-icons/react/ssr'
import { getSiteSettings } from '@/lib/data/public'
import { formatPhone } from '@/lib/format'
import { ButtonLink } from './ButtonLink'
import { CartLink } from './cart/CartLink'
import { Logo } from './Logo'
import { MobileMenu } from './MobileMenu'
import { DONATE_HREF, NAV_LINKS } from './nav'

/** Bandeau de coordonnées bleu marine au-dessus de l'en-tête (comme le site de référence). */
async function TopBar() {
  const settings = await getSiteSettings()
  const email = settings.emails[0]
  return (
    <div className="on-navy text-xs md:text-sm">
      <div className="mx-auto flex min-h-9 max-w-[1320px] flex-wrap items-center justify-between gap-x-6 gap-y-1 px-4 py-1.5 md:px-8">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
          {settings.phone && (
            <a
              href={`tel:${settings.phone}`}
              className="hover:text-orange inline-flex items-center gap-1.5"
            >
              <Phone size={15} className="text-orange" aria-hidden />
              {formatPhone(settings.phone)}
            </a>
          )}
          {email && (
            <a
              href={`mailto:${email}`}
              className="hover:text-orange hidden items-center gap-1.5 sm:inline-flex"
            >
              <EnvelopeSimple size={15} className="text-orange" aria-hidden />
              {email}
            </a>
          )}
        </div>
        {settings.tagline && (
          <p className="text-ink-soft hidden font-semibold lg:block">{settings.tagline}</p>
        )}
      </div>
    </div>
  )
}

export function Header() {
  return (
    <>
      <TopBar />
      <header className="border-line bg-cream/95 sticky top-0 z-30 border-b shadow-sm backdrop-blur-md">
        <div className="mx-auto flex h-[72px] max-w-[1320px] items-center justify-between gap-4 px-4 md:px-8">
          <Logo />

          <nav
            aria-label="Navigation principale"
            className="hidden items-center gap-5 xl:flex 2xl:gap-7"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-ink hover:text-ochre text-sm font-semibold whitespace-nowrap transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <CartLink />
            <ButtonLink href={DONATE_HREF} className="hidden min-h-11 px-5 sm:inline-flex">
              <HandHeart size={18} aria-hidden />
              Faire un don
            </ButtonLink>
            <Suspense fallback={<span className="size-11 xl:hidden" />}>
              <MobileMenu />
            </Suspense>
          </div>
        </div>
      </header>
    </>
  )
}
