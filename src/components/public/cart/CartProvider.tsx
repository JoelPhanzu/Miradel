'use client'

import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Currency } from '@/lib/pricing/types'

export interface CartLine {
  productId: string
  slug: string
  name: string
  imageUrl: string | null
  /** Prix affiché au moment de l'ajout. Le prix enregistré est recalculé par le serveur. */
  unitAmount: number
  currency: Currency
  quantity: number
  variant: Record<string, string>
}

interface CartContextValue {
  lines: CartLine[]
  count: number
  ready: boolean
  add: (line: CartLine) => void
  setQuantity: (key: string, quantity: number) => void
  remove: (key: string) => void
  clear: () => void
}

const STORAGE_KEY = 'miradel-panier'
const CartContext = createContext<CartContextValue | null>(null)

export function lineKey(line: Pick<CartLine, 'productId' | 'variant'>): string {
  const variant = Object.entries(line.variant)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('&')
  return `${line.productId}?${variant}`
}

function readStorage(): CartLine[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? (parsed as CartLine[]) : []
  } catch {
    return []
  }
}

function writeStorage(lines: CartLine[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines))
  } catch {
    // Navigation privée ou stockage plein : le panier reste en mémoire pour cette visite.
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Lecture différée : localStorage n'existe pas au rendu serveur.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLines(readStorage())
    setReady(true)
  }, [])

  const update = useCallback((next: (current: CartLine[]) => CartLine[]) => {
    setLines((current) => {
      const value = next(current)
      writeStorage(value)
      return value
    })
  }, [])

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      ready,
      count: lines.reduce((sum, l) => sum + l.quantity, 0),
      add: (line) =>
        update((current) => {
          const key = lineKey(line)
          const existing = current.find((l) => lineKey(l) === key)
          if (!existing) return [...current, line]
          return current.map((l) =>
            lineKey(l) === key ? { ...l, quantity: Math.min(50, l.quantity + line.quantity) } : l,
          )
        }),
      setQuantity: (key, quantity) =>
        update((current) =>
          current.map((l) =>
            lineKey(l) === key ? { ...l, quantity: Math.max(1, Math.min(50, quantity)) } : l,
          ),
        ),
      remove: (key) => update((current) => current.filter((l) => lineKey(l) !== key)),
      clear: () => update(() => []),
    }),
    [lines, ready, update],
  )

  return <CartContext value={value}>{children}</CartContext>
}

export function useCart(): CartContextValue {
  const context = use(CartContext)
  if (!context) throw new Error('useCart doit être utilisé dans <CartProvider>')
  return context
}
