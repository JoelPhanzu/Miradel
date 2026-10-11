'use client'

import Link from 'next/link'
import { Check, Minus, Plus, ShoppingBag } from '@phosphor-icons/react'
import { useState } from 'react'
import type { ProductVariants } from '@/db/schema'
import type { Currency } from '@/lib/pricing/types'
import { useCart } from './CartProvider'

interface AddToCartProps {
  product: {
    id: string
    slug: string
    name: string
    imageUrl: string | null
    unitAmount: number
    currency: Currency
    variants: ProductVariants
    outOfStock: boolean
  }
  /** Version compacte (cartes du catalogue) : un seul bouton, sans choix de variante. */
  compact?: boolean
}

export function AddToCart({ product, compact }: AddToCartProps) {
  const { add } = useCart()
  const variantNames = Object.keys(product.variants).filter((k) => product.variants[k].length > 0)
  const [variant, setVariant] = useState<Record<string, string>>(() =>
    Object.fromEntries(variantNames.map((k) => [k, product.variants[k][0]])),
  )
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  if (product.outOfStock) {
    return <p className="text-ink-soft text-sm font-semibold">Rupture de stock</p>
  }

  // Un produit à variantes se choisit sur sa fiche.
  if (compact && variantNames.length > 0) {
    return (
      <Link
        href={`/produits/${product.slug}`}
        className="border-ink/70 hover:bg-ink hover:text-cream inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition"
      >
        Choisir
      </Link>
    )
  }

  function handleAdd() {
    add({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      imageUrl: product.imageUrl,
      unitAmount: product.unitAmount,
      currency: product.currency,
      quantity,
      variant,
    })
    setAdded(true)
    window.setTimeout(() => setAdded(false), 2200)
  }

  return (
    <div className={compact ? '' : 'space-y-6'}>
      {!compact &&
        variantNames.map((name) => (
          <fieldset key={name}>
            <legend className="mb-2 text-sm font-semibold capitalize">{name}</legend>
            <div className="flex flex-wrap gap-2">
              {product.variants[name].map((option) => {
                const selected = variant[name] === option
                return (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setVariant((v) => ({ ...v, [name]: option }))}
                    className={`min-h-11 rounded-full border px-4 text-sm transition ${
                      selected ? 'bg-ink text-cream border-ink' : 'border-line hover:border-ink'
                    }`}
                  >
                    {option}
                  </button>
                )
              })}
            </div>
          </fieldset>
        ))}

      <div className="flex flex-wrap items-center gap-3">
        {!compact && (
          <div className="border-line flex items-center rounded-full border">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="flex size-11 items-center justify-center"
              aria-label="Diminuer la quantité"
            >
              <Minus size={16} aria-hidden />
            </button>
            <span className="w-8 text-center font-semibold" aria-live="polite">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(50, q + 1))}
              className="flex size-11 items-center justify-center"
              aria-label="Augmenter la quantité"
            >
              <Plus size={16} aria-hidden />
            </button>
          </div>
        )}
        <button
          type="button"
          onClick={handleAdd}
          className={`inline-flex items-center justify-center gap-2 rounded-full font-semibold transition active:scale-[0.98] ${
            compact
              ? 'border-ink/70 hover:bg-ink hover:text-cream min-h-11 border px-4 text-sm'
              : 'bg-accent text-accent-ink hover:bg-ink hover:text-cream min-h-12 px-7 text-sm'
          }`}
        >
          {added ? <Check size={18} aria-hidden /> : <ShoppingBag size={18} aria-hidden />}
          {added ? 'Ajouté' : 'Ajouter au panier'}
        </button>
        {added && !compact && (
          <Link href="/panier" className="text-sm font-semibold underline underline-offset-4">
            Voir le panier
          </Link>
        )}
      </div>
    </div>
  )
}
