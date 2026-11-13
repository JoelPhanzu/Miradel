import { Suspense } from 'react'
import { EnvelopeSimple, HandHeart, MapPin, Phone } from '@phosphor-icons/react/ssr'
import { getPublishedPrograms, getSiteSettings } from '@/lib/data/public'
import { formatPhone } from '@/lib/format'
import { ButtonLink } from './ButtonLink'
import { CartLink } from './cart/CartLink'
import { Logo } from './Logo'
import { MainNav } from './MainNav'
import { MobileMenu } from './MobileMenu'
import { DONATE_HREF } from './nav'

/** Ville affichée dans la barre du haut : dernière partie de l'adresse du siège, sinon le pays. */
function cityOf(address: string | null): string {
  const parts = (address ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  return parts.at(-1) ?? 'République démocratique du Congo'
}

/**
 * Barre du haut bleu marine. Sur mobile, seul le téléphone s'affiche ; l'e-mail apparaît à
 * partir de sm, la ville à partir de md, le slogan à partir de lg.
 */
async function TopBar() {
  const settings = await getSiteSettings()
  const email = settings.emails[0]
  return (
    <div className="bg-navy-900 text-xs text-white md:text-sm">
      <div className="mx-auto flex min-h-10 max-w-7xl items-center justify-between gap-6 px-4 py-1.5 sm:px-6">
        <ul className="flex shrink-0 items-center gap-x-5">
          {settings.phone && (
            <li className="shrink-0">
              <a
                href={`tel:${settings.phone}`}
                className="inline-flex min-h-8 items-center gap-1.5 hover:text-orange-400"
              >
                <Phone size={15} weight="fill" className="text-orange-500" aria-hidden />
                {formatPhone(settings.phone)}
              </a>
            </li>
          )}
          {email && (
            <li className="hidden min-w-0 sm:flex">
              <a
                href={`mailto:${email}`}
                className="flex min-h-8 min-w-0 items-center gap-1.5 hover:text-orange-400"
              >
                <EnvelopeSimple
                  size={15}
                  weight="fill"
                  className="shrink-0 text-orange-500"
                  aria-hidden
                />
                <span className="truncate">{email}</span>
              </a>
            </li>
          )}
          <li className="hidden shrink-0 items-center gap-1.5 md:inline-flex">
            <MapPin size={15} weight="fill" className="text-orange-500" aria-hidden />
            {cityOf(settings.address)}
          </li>
        </ul>
        {settings.tagline && (
          <p className="hidden min-w-0 shrink items-center gap-3 italic lg:flex">
            <span className="h-4 w-1.5 shrink-0 -skew-x-[25deg] bg-orange-500" aria-hidden />
            <span className="truncate">{settings.tagline}</span>
          </p>
        )}
      </div>
    </div>
  )
}

async function Navigation() {
  const programs = (await getPublishedPrograms()).map((p) => ({ slug: p.slug, title: p.title }))
  return (
    <>
      <MainNav programs={programs} />
      <div className="flex shrink-0 items-center gap-2">
        <CartLink />
        {/* Sur mobile, le bouton de don est dans le menu (place réservée au burger). */}
        <span className="hidden sm:block">
          <ButtonLink href={DONATE_HREF} arrow={false} className="min-h-11 px-5 py-2">
            <HandHeart size={18} weight="fill" aria-hidden />
            Faire un don
          </ButtonLink>
        </span>
        <MobileMenu programs={programs} />
      </div>
    </>
  )
}

export function Header() {
  return (
    <>
      <Suspense fallback={<div className="bg-navy-900 min-h-10" />}>
        <TopBar />
      </Suspense>
      <header className="border-border sticky top-0 z-30 border-b bg-white/95 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 md:h-[72px]">
          <Logo />
          <Suspense fallback={<span className="size-11" />}>
            <Navigation />
          </Suspense>
        </div>
      </header>
    </>
  )
}
