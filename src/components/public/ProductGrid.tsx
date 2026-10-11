import { connection } from 'next/server'
import { Suspense } from 'react'
import { getPromotions } from '@/lib/data/public'
import { productPrice } from '@/lib/pricing/items'
import type { Product } from '@/types/content'
import { ProductCard } from './ProductCard'

/** Prix calculés à la requête : ils dépendent des offres du jour (heure de Kinshasa). */
async function PricedGrid({ products }: { products: Product[] }) {
  await connection()
  const promotions = await getPromotions()
  const now = new Date()
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-6 lg:grid-cols-4">
      {products.map((product) => (
        <li key={product.id} data-reveal>
          <ProductCard product={product} price={productPrice(product, promotions, now)} />
        </li>
      ))}
    </ul>
  )
}

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <Suspense fallback={<div className="bg-cream-deep h-96 animate-pulse" />}>
      <PricedGrid products={products} />
    </Suspense>
  )
}
