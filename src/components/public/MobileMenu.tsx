'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { List, X } from '@phosphor-icons/react'
import { useEffect, useRef } from 'react'
import { DONATE_HREF, NAV_LINKS } from './nav'

/** Menu mobile basé sur <details> : fonctionne sans JS, se referme après navigation. */
export function MobileMenu() {
  const pathname = usePathname()
  const ref = useRef<HTMLDetailsElement>(null)

  useEffect(() => {
    if (ref.current) ref.current.open = false
  }, [pathname])

  return (
    <details ref={ref} className="group xl:hidden">
      <summary
        className="border-line flex size-11 cursor-pointer list-none items-center justify-center rounded-full border [&::-webkit-details-marker]:hidden"
        aria-label="Menu"
      >
        <List size={22} className="group-open:hidden" aria-hidden />
        <X size={22} className="hidden group-open:block" aria-hidden />
      </summary>
      <nav
        aria-label="Navigation principale"
        className="border-line bg-cream absolute inset-x-0 top-[72px] max-h-[calc(100dvh-72px)] overflow-y-auto border-b px-4 pt-2 pb-6 shadow-[0_24px_40px_-24px_rgb(28_42_33/0.35)]"
      >
        <ul>
          {[...NAV_LINKS, { href: '/sengager', label: 'S’engager' }].map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="border-line/60 font-display flex min-h-14 items-center border-b text-2xl"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        <Link
          href={DONATE_HREF}
          className="bg-accent text-accent-ink mt-6 flex min-h-12 w-full items-center justify-center rounded-full text-sm font-semibold"
        >
          Faire un don
        </Link>
      </nav>
    </details>
  )
}
