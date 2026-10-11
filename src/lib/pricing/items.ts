import type { Product } from '@/types/content'
import { getEffectivePrice } from '.'
import type { EffectivePrice, PricedItem, Promotion } from './types'

/** null si le prix du produit n'est pas encore confirmé (commande sur WhatsApp uniquement). */
export function productItem(product: Product): PricedItem | null {
  if (product.priceAmount === null) return null
  return {
    id: product.id,
    categoryId: product.categoryId,
    priceAmount: product.priceAmount,
    currency: product.currency,
  }
}

/**
 * Prix unitaire d'un produit pour une quantité (1 par défaut : prix affiché).
 * Un « prix barré » saisi à la main sert de prix de référence affiché.
 */
export function productPrice(
  product: Product,
  promotions: Promotion[],
  now: Date,
  quantity = 1,
): EffectivePrice | null {
  const item = productItem(product)
  if (!item) return null
  const price = getEffectivePrice(item, quantity, promotions, now)
  if (
    !price.appliedPromotion &&
    product.compareAtAmount &&
    product.compareAtAmount > price.amount
  ) {
    return { ...price, baseAmount: product.compareAtAmount }
  }
  return price
}
