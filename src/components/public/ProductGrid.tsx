import { connection } from 'next/server'
import { Suspense } from 'react'
import { getPromotions, getPublishedEntrepreneurs, getSiteSettings } from '@/lib/data/public'
import { productPrice } from '@/lib/pricing/items'
import { productSale } from '@/lib/vitrine'
import type { Product } from '@/types/content'
import { ProductCard } from './ProductCard'

/** Prix calculés à la requête : ils dépendent des offres du jour (heure de Kinshasa). */
async function PricedGrid({ products, hideSeller }: { products: Product[]; hideSeller?: boolean }) {
  await connection()
  const [promotions, entrepreneurs, settings] = await Promise.all([
    getPromotions(),
    getPublishedEntrepreneurs(),
    getSiteSettings(),
  ])
  const now = new Date()
  return (
    <ul className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
      {products.map((product) => {
        const price = productPrice(product, promotions, now)
        const { seller, whatsappUrl } = productSale(product, entrepreneurs, settings, price)
        return (
          <li key={product.id} data-reveal>
            <ProductCard
              product={product}
              price={price}
              seller={hideSeller ? null : seller}
              whatsappUrl={whatsappUrl}
            />
          </li>
        )
      })}
    </ul>
  )
}

/** `hideSeller` : sur la vitrine d'un entrepreneur, son nom n'est pas répété sur chaque carte. */
export function ProductGrid({
  products,
  hideSeller,
}: {
  products: Product[]
  hideSeller?: boolean
}) {
  return (
    <Suspense fallback={<div className="bg-cream-deep h-96 animate-pulse" />}>
      <PricedGrid products={products} hideSeller={hideSeller} />
    </Suspense>
  )
}
