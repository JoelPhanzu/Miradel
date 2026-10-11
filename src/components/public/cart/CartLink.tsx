'use client'

import Link from 'next/link'
import { ShoppingBag } from '@phosphor-icons/react'
import { useCart } from './CartProvider'

export function CartLink() {
  const { count } = useCart()
  return (
    <Link
      href="/panier"
      aria-label={count > 0 ? `Panier, ${count} article${count > 1 ? 's' : ''}` : 'Panier'}
      className="border-line hover:border-ink relative flex size-11 items-center justify-center rounded-full border transition-colors"
    >
      <ShoppingBag size={20} aria-hidden />
      {count > 0 && (
        <span className="bg-accent text-accent-ink absolute -top-1 -right-1 flex min-w-5 items-center justify-center rounded-full px-1 text-[0.68rem] leading-5 font-semibold">
          {count}
        </span>
      )}
    </Link>
  )
}
