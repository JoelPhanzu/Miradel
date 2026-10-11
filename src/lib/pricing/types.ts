export type Currency = 'CDF' | 'USD'

export type DiscountType = 'percentage' | 'fixed_amount' | 'display_only'

export type PromotionScope = 'all_products' | 'product_category' | 'items'

export type PromotionTargetType = 'product' | 'product_category'

export interface PromotionTarget {
  targetType: PromotionTargetType
  targetId: string
}

export interface Promotion {
  id: string
  title: string
  /** Texte affiché (bannière, page Offres). N'intervient pas dans le calcul. */
  description?: string | null
  discountType: DiscountType
  /** Pourcentage (0-100) ou montant dans la devise de l'article. */
  discountValue: number
  scope: PromotionScope
  targets: PromotionTarget[]
  /** ISO 8601, bornes facultatives. */
  startsAt: string | null
  endsAt: string | null
  /** Jours ISO : 1 = lundi ... 7 = dimanche. null ou vide = tous les jours. */
  weekdays: number[] | null
  /** Réduction par quantité : à partir de N unités du même produit. null = dès 1. */
  minQuantity: number | null
  isActive: boolean
  priority: number
}

export interface PricedItem {
  id: string
  categoryId: string | null
  priceAmount: number
  currency: Currency
}

export interface EffectivePrice {
  /** Prix unitaire après promotion (égal au prix de base sans promotion). */
  amount: number
  baseAmount: number
  currency: Currency
  /** Promotion appliquée au prix, s'il y en a une. */
  appliedPromotion: Pick<Promotion, 'id' | 'title'> | null
  discountAmount: number
}
