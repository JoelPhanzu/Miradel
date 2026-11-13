import Link from 'next/link'
import { WhatsappLogo } from '@phosphor-icons/react/ssr'
import type { EffectivePrice } from '@/lib/pricing/types'
import type { Product } from '@/types/content'
import { AddToCart } from './cart/AddToCart'
import { PhotoSlot } from './PhotoSlot'
import { PriceTag } from './PriceTag'

export interface ProductSeller {
  name: string
  slug: string
  isFoundation: boolean
}

/**
 * Carte du catalogue.
 * - Produit de la fondation avec prix : ajout au panier.
 * - Produit d'un entrepreneur : « Commander sur WhatsApp » (lien direct vers le vendeur).
 * - Prix à confirmer : la commande passe par la fiche produit.
 */
export function ProductCard({
  product,
  price,
  seller,
  whatsappUrl,
}: {
  product: Product
  price: EffectivePrice | null
  seller?: ProductSeller | null
  /** Renseigné pour un produit d'entrepreneur (pas de panier). */
  whatsappUrl?: string | null
}) {
  return (
    <article className="flex h-full flex-col">
      <Link href={`/produits/${product.slug}`} className="group block overflow-hidden rounded-2xl">
        <PhotoSlot
          src={product.images[0]}
          alt={product.name}
          brief={`photo du produit ${product.name} sur fond neutre`}
          className="aspect-[4/5] transition duration-700 group-hover:scale-[1.03]"
          sizes="(min-width: 1024px) 24vw, (min-width: 640px) 45vw, 50vw"
        />
      </Link>
      {seller && (
        <Link
          href={`/vitrine/${seller.slug}`}
          className="text-ochre mt-4 line-clamp-1 text-xs font-bold tracking-[0.12em] uppercase hover:underline"
        >
          {seller.name}
        </Link>
      )}
      <h3 className={`font-display text-xl leading-tight font-bold ${seller ? 'mt-1' : 'mt-4'}`}>
        <Link href={`/produits/${product.slug}`} className="hover:text-accent">
          {product.name}
        </Link>
      </h3>
      {product.packaging && product.packaging !== '[À COMPLÉTER]' && (
        <p className="text-ink-soft text-sm">{product.packaging}</p>
      )}
      <PriceTag price={price} className="mt-1" />
      <div className="mt-auto pt-4">
        {whatsappUrl ? (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-whatsapp inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold text-white dark:text-[#10261a]"
          >
            <WhatsappLogo size={18} weight="fill" aria-hidden />
            Commander
          </a>
        ) : price ? (
          <AddToCart
            compact
            product={{
              id: product.id,
              slug: product.slug,
              name: product.name,
              imageUrl: product.images[0] ?? null,
              unitAmount: price.amount,
              currency: price.currency,
              variants: product.variants,
              outOfStock: product.stock === 0,
            }}
          />
        ) : (
          <Link
            href={`/produits/${product.slug}`}
            className="border-ink/70 hover:bg-ink hover:text-cream inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition"
          >
            Voir le produit
          </Link>
        )}
      </div>
    </article>
  )
}
