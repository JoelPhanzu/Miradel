'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { HandHeart, House, List, Package } from '@phosphor-icons/react'
import { ADMIN_NAV } from './nav'

const isActive = (pathname: string, href: string) =>
  href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)

/** Menu latéral (ordinateur). */
export function AdminSidebar() {
  const pathname = usePathname()
  const groups = [...new Set(ADMIN_NAV.map((i) => i.group))]
  return (
    <nav aria-label="Administration" className="grid gap-6">
      {groups.map((group) => (
        <div key={group}>
          <p className="text-ink-soft px-3 text-xs font-semibold tracking-[0.14em] uppercase">
            {group}
          </p>
          <ul className="mt-2 grid gap-0.5">
            {ADMIN_NAV.filter((i) => i.group === group).map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(pathname, item.href) ? 'page' : undefined}
                  className="hover:bg-cream-deep aria-[current=page]:bg-ink aria-[current=page]:text-cream flex min-h-10 items-center rounded-xl px-3 text-sm font-medium"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  )
}

/** Barre du bas (téléphone) : les trois écrans du quotidien + le menu complet. */
export function AdminBottomNav() {
  const pathname = usePathname()
  const items = [
    { href: '/admin', label: 'Accueil', Icon: House },
    { href: '/admin/commandes', label: 'Commandes', Icon: Package },
    { href: '/admin/dons', label: 'Dons', Icon: HandHeart },
    { href: '/admin/menu', label: 'Menu', Icon: List },
  ]
  return (
    <nav
      aria-label="Navigation rapide"
      className="border-line bg-cream fixed inset-x-0 bottom-0 z-30 grid h-[68px] grid-cols-4 border-t md:hidden"
    >
      {items.map(({ href, label, Icon }) => {
        const active =
          href === '/admin/menu'
            ? !items.slice(0, 3).some((i) => isActive(pathname, i.href))
            : isActive(pathname, href)
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            className="text-ink-soft aria-[current=page]:text-accent flex flex-col items-center justify-center gap-1 text-[0.72rem] font-semibold"
          >
            <Icon size={24} weight={active ? 'fill' : 'regular'} aria-hidden />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
