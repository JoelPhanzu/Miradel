'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CaretDown, HandHeart, List, X } from '@phosphor-icons/react'
import { useEffect, useId, useRef, useState, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { DONATE_HREF, isActive, NAV_LINKS, PROGRAMS_HREF, type NavProgram } from './nav'

/**
 * Menu mobile (sous xl) : tiroir qui s'ouvre depuis la droite, fond assombri.
 * Se ferme avec Échap, d'un clic à côté ou après navigation ; bloque le défilement derrière ;
 * sous-menu des programmes repliable.
 */
const noop = () => () => {}

export function MobileMenu({ programs }: { programs: NavProgram[] }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [programsOpen, setProgramsOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const submenuId = useId()
  // Le tiroir est rendu dans <body> : l'en-tête (flou d'arrière-plan) piégerait sinon le
  // positionnement « fixed ».
  const mounted = useSyncExternalStore(
    noop,
    () => true,
    () => false,
  )

  // Referme le menu après une navigation (ajustement pendant le rendu, sans effet).
  const [lastPath, setLastPath] = useState(pathname)
  if (pathname !== lastPath) {
    setLastPath(pathname)
    setOpen(false)
  }

  useEffect(() => {
    if (!open) return
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    panelRef.current?.querySelector<HTMLElement>('a, button')?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = overflow
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const linkClass = (active: boolean) =>
    `flex min-h-12 min-w-0 grow items-center rounded-lg px-3 text-base font-semibold break-words ${
      active ? 'bg-orange-500 text-navy-950' : 'text-navy-900 hover:bg-gray-50'
    }`

  return (
    <div className="xl:hidden">
      <button
        ref={buttonRef}
        type="button"
        aria-label="Ouvrir le menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="border-border text-navy-900 flex size-11 items-center justify-center rounded-full border"
      >
        <List size={22} weight="bold" aria-hidden />
      </button>

      {mounted &&
        createPortal(
          <>
            {/* Fond assombri : un clic à côté du tiroir le referme. */}
            <div
              aria-hidden
              onClick={() => setOpen(false)}
              className={`bg-navy-950/60 fixed inset-0 z-40 transition-opacity duration-300 ${
                open ? 'opacity-100' : 'pointer-events-none opacity-0'
              }`}
            />

            <div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-label="Menu"
              inert={!open}
              className={`fixed inset-y-0 right-0 z-50 flex w-[min(22rem,88vw)] flex-col bg-white shadow-2xl transition-[visibility,transform] duration-300 ease-out ${
                open ? 'visible translate-x-0' : 'invisible translate-x-full'
              }`}
            >
              <div className="border-border flex h-16 shrink-0 items-center justify-between border-b px-4">
                <span className="font-display text-navy-900 font-extrabold">Menu</span>
                <button
                  type="button"
                  aria-label="Fermer le menu"
                  onClick={() => {
                    setOpen(false)
                    buttonRef.current?.focus()
                  }}
                  className="border-border text-navy-900 flex size-11 items-center justify-center rounded-full border"
                >
                  <X size={22} weight="bold" aria-hidden />
                </button>
              </div>

              <nav aria-label="Navigation principale" className="grow overflow-y-auto px-3 py-4">
                <ul className="grid gap-1">
                  {[...NAV_LINKS, { href: '/sengager', label: 'S’engager' }].map((link) => {
                    const active = isActive(pathname, link.href)
                    if (link.href === PROGRAMS_HREF && programs.length > 0) {
                      return (
                        <li key={link.href}>
                          <div className="flex items-center gap-1">
                            <Link
                              href={link.href}
                              aria-current={active ? 'page' : undefined}
                              className={linkClass(active)}
                            >
                              {link.label}
                            </Link>
                            <button
                              type="button"
                              aria-expanded={programsOpen}
                              aria-controls={submenuId}
                              aria-label="Afficher la liste des programmes"
                              onClick={() => setProgramsOpen((o) => !o)}
                              className="text-navy-900 flex size-12 shrink-0 items-center justify-center rounded-lg hover:bg-gray-50"
                            >
                              <CaretDown
                                size={16}
                                weight="bold"
                                className={`transition-transform ${programsOpen ? 'rotate-180' : ''}`}
                                aria-hidden
                              />
                            </button>
                          </div>
                          <ul
                            id={submenuId}
                            hidden={!programsOpen}
                            className="mt-1 ml-3 grid gap-1 border-l-2 border-orange-500 pl-2"
                          >
                            {programs.map((p) => {
                              const href = `${PROGRAMS_HREF}/${p.slug}`
                              return (
                                <li key={p.slug}>
                                  <Link
                                    href={href}
                                    aria-current={pathname === href ? 'page' : undefined}
                                    className="text-ink-700 flex min-h-11 items-center rounded-lg px-3 text-sm font-semibold break-words hover:bg-gray-50 aria-[current=page]:text-orange-700"
                                  >
                                    {p.title}
                                  </Link>
                                </li>
                              )
                            })}
                          </ul>
                        </li>
                      )
                    }
                    return (
                      <li key={link.href} className="flex">
                        <Link
                          href={link.href}
                          aria-current={active ? 'page' : undefined}
                          className={linkClass(active)}
                        >
                          {link.label}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </nav>

              <div className="border-border shrink-0 border-t p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
                <Link
                  href={DONATE_HREF}
                  className="text-navy-950 flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-orange-500 px-6 text-sm font-bold hover:bg-orange-400"
                >
                  <HandHeart size={18} weight="fill" aria-hidden />
                  Faire un don
                </Link>
              </div>
            </div>
          </>,
          document.body,
        )}
    </div>
  )
}
