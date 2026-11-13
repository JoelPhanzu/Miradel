import Link from 'next/link'
import { WhatsappLogo } from '@phosphor-icons/react/ssr'
import type { EffectivePrice } from '@/lib/pricing/types'
import type { Product } from '@/types/content'
import { AddToCart } from './cart/AddToCart'
import { cardClass, cardImageClass } from './cards'
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
    <article className={cardClass}>
      <Link
        href={`/produits/${product.slug}`}
        tabIndex={-1}
        aria-hidden
        className="block overflow-hidden"
      >
        <PhotoSlot
          src={product.images[0]}
          alt=""
          brief={`photo du produit ${product.name} sur fond neutre`}
          className="aspect-[4/5]"
          imageClassName={cardImageClass}
          sizes="(min-width: 1024px) 24vw, (min-width: 640px) 45vw, 50vw"
        />
      </Link>
      <div className="flex min-w-0 grow flex-col p-3 sm:p-4">
        {seller && (
          <Link
            href={`/vitrine/${seller.slug}`}
            className="text-ochre line-clamp-1 text-xs font-bold tracking-[0.12em] uppercase hover:underline"
          >
            {seller.name}
          </Link>
        )}
        <h3
          className={`font-display text-heading text-lg leading-tight font-extrabold break-words ${seller ? 'mt-1' : ''}`}
        >
          <Link href={`/produits/${product.slug}`} className="hover:text-orange-700">
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
              className="bg-whatsapp text-navy-950 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full px-3 text-sm font-bold"
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
              className="border-navy-800 text-navy-800 hover:bg-navy-800 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border-2 px-3 text-center text-sm leading-tight font-bold transition hover:text-white"
            >
              Voir le produit
            </Link>
          )}
        </div>
      </div>
    </article>
  )
}
