export const PROGRAMS_HREF = '/nos-programmes'

export const NAV_LINKS = [
  { href: '/la-fondation', label: 'La Fondation' },
  { href: PROGRAMS_HREF, label: 'Nos programmes' },
  { href: '/notre-impact', label: 'Notre impact' },
  { href: '/transparence', label: 'Transparence' },
  { href: '/vitrine', label: 'Vitrine de l’entrepreneur' },
  { href: '/actualites', label: 'Actualités' },
  { href: '/contact', label: 'Contact' },
] as const

export const DONATE_HREF = '/sengager/faire-un-don'

/** Programme listé dans le menu déroulant. */
export interface NavProgram {
  slug: string
  title: string
}

/** Lien actif : page elle-même ou l'une de ses sous-pages (les fiches produits relèvent de la vitrine). */
export function isActive(pathname: string, href: string): boolean {
  if (pathname === href || pathname.startsWith(`${href}/`)) return true
  return href === '/vitrine' && (pathname.startsWith('/produits/') || pathname === '/promotions')
}
