'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CaretDown } from '@phosphor-icons/react'
import { useEffect, useRef, useState } from 'react'
import { isActive, NAV_LINKS, PROGRAMS_HREF, type NavProgram } from './nav'

const linkBase =
  'inline-flex min-h-11 items-center gap-1 rounded-full px-3 text-[0.8125rem] font-semibold whitespace-nowrap transition-colors 2xl:px-4 2xl:text-sm'
const linkIdle = 'text-navy-900 hover:text-orange-700'
const linkActive = 'bg-orange-500 text-navy-950'

/** Menu principal (ordinateur) : lien actif en pastille orange, menu déroulant des programmes. */
export function MainNav({ programs }: { programs: NavProgram[] }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLLIElement>(null)

  // Referme le menu après une navigation (ajustement pendant le rendu, sans effet).
  const [lastPath, setLastPath] = useState(pathname)
  if (pathname !== lastPath) {
    setLastPath(pathname)
    setOpen(false)
  }

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onClick)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onClick)
    }
  }, [open])

  return (
    <nav aria-label="Navigation principale" className="hidden xl:block">
      <ul className="flex items-center gap-0.5">
        {NAV_LINKS.map((link) => {
          const active = isActive(pathname, link.href)
          if (link.href === PROGRAMS_HREF && programs.length > 0) {
            return (
              <li
                key={link.href}
                ref={ref}
                className="relative"
                onMouseEnter={() => setOpen(true)}
                onMouseLeave={() => setOpen(false)}
              >
                <div
                  className={`flex items-center rounded-full transition-colors ${active ? linkActive : linkIdle}`}
                >
                  <Link
                    href={link.href}
                    aria-current={active ? 'page' : undefined}
                    className={`${linkBase} pr-0.5 2xl:pr-1`}
                  >
                    {link.label}
                  </Link>
                  <button
                    type="button"
                    aria-expanded={open}
                    aria-controls="menu-programmes"
                    aria-label="Afficher la liste des programmes"
                    onClick={() => setOpen((o) => !o)}
                    className="mr-1 flex size-8 items-center justify-center rounded-full"
                  >
                    <CaretDown
                      size={12}
                      weight="bold"
                      className={`transition-transform ${open ? 'rotate-180' : ''}`}
                      aria-hidden
                    />
                  </button>
                </div>
                <div
                  id="menu-programmes"
                  hidden={!open}
                  className="absolute top-full left-0 z-40 w-72 pt-2"
                >
                  <ul className="border-border rounded-xl border bg-white p-2 shadow-xl">
                    {programs.map((p) => (
                      <li key={p.slug}>
                        <Link
                          href={`${PROGRAMS_HREF}/${p.slug}`}
                          aria-current={
                            pathname === `${PROGRAMS_HREF}/${p.slug}` ? 'page' : undefined
                          }
                          className="text-navy-900 flex min-h-11 items-center rounded-lg px-3 text-sm font-semibold hover:bg-gray-50 hover:text-orange-700 aria-[current=page]:text-orange-700"
                        >
                          {p.title}
                        </Link>
                      </li>
                    ))}
                    <li className="border-border mt-1 border-t pt-1">
                      <Link
                        href={PROGRAMS_HREF}
                        className="flex min-h-11 items-center rounded-lg px-3 text-sm font-bold text-orange-700 hover:bg-gray-50"
                      >
                        Tous les programmes
                      </Link>
                    </li>
                  </ul>
                </div>
              </li>
            )
          }
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={active ? 'page' : undefined}
                className={`${linkBase} ${active ? linkActive : linkIdle}`}
              >
                {link.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
