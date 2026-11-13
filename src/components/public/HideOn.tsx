'use client'

import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

/** Masque son contenu sur les chemins indiqués (le bandeau d'appel est intégré à l'accueil). */
export function HideOn({ paths, children }: { paths: string[]; children: ReactNode }) {
  const pathname = usePathname()
  return paths.includes(pathname) ? null : children
}
