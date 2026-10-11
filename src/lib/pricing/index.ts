import type { Currency, EffectivePrice, PricedItem, Promotion } from './types'

export type * from './types'

export const KINSHASA_TIME_ZONE = 'Africa/Kinshasa'

const weekdayFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: KINSHASA_TIME_ZONE,
  weekday: 'short',
})

const ISO_WEEKDAYS: Record<string, number> = {
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
  Sun: 7,
}

/** Jour ISO (1 = lundi ... 7 = dimanche) à l'heure de Kinshasa. */
export function getKinshasaWeekday(date: Date): number {
  return ISO_WEEKDAYS[weekdayFormatter.format(date)]
}

/** Promotion active à cette date (statut, période et jour de la semaine à Kinshasa). */
export function isPromotionActive(promotion: Promotion, date: Date): boolean {
  if (!promotion.isActive) return false
  const time = date.getTime()
  if (promotion.startsAt && time < new Date(promotion.startsAt).getTime()) return false
  if (promotion.endsAt && time > new Date(promotion.endsAt).getTime()) return false
  if (promotion.weekdays && promotion.weekdays.length > 0) {
    return promotion.weekdays.includes(getKinshasaWeekday(date))
  }
  return true
}

/** La portée de la promotion couvre-t-elle ce produit ? */
export function promotionCoversItem(promotion: Promotion, item: PricedItem): boolean {
  switch (promotion.scope) {
    case 'all_products':
      return true
    case 'product_category':
      if (!item.categoryId) return false
      return promotion.targets.some(
        (t) => t.targetType === 'product_category' && t.targetId === item.categoryId,
      )
    case 'items':
      return promotion.targets.some((t) => t.targetType === 'product' && t.targetId === item.id)
  }
}

/**
 * Arrondi du prix remisé.
 * CDF : à la centaine inférieure (47 650 -> 47 600). Règle à confirmer avec la fondation.
 * USD : montant en cents, arrondi au cent inférieur.
 */
export function roundDiscountedAmount(amount: number, currency: Currency): number {
  const floored = Math.floor(amount)
  return currency === 'CDF' ? Math.floor(floored / 100) * 100 : floored
}

function discountedAmount(promotion: Promotion, item: PricedItem): number | null {
  if (promotion.discountType === 'display_only') return null
  const raw =
    promotion.discountType === 'percentage'
      ? item.priceAmount * (1 - promotion.discountValue / 100)
      : item.priceAmount - promotion.discountValue
  return Math.max(0, roundDiscountedAmount(raw, item.currency))
}

/**
 * Prix unitaire effectif d'un produit, pour une quantité donnée, à une date donnée.
 * Pas de cumul : la promotion donnant le prix le plus bas l'emporte ;
 * à égalité, la priorité la plus haute.
 */
export function getEffectivePrice(
  item: PricedItem,
  quantity: number,
  promotions: Promotion[],
  date: Date,
): EffectivePrice {
  let best: { promotion: Promotion; amount: number } | null = null

  for (const promotion of promotions) {
    if (!isPromotionActive(promotion, date) || !promotionCoversItem(promotion, item)) continue
    if (promotion.minQuantity && quantity < promotion.minQuantity) continue
    const amount = discountedAmount(promotion, item)
    if (amount === null || amount >= item.priceAmount) continue
    if (
      !best ||
      amount < best.amount ||
      (amount === best.amount && promotion.priority > best.promotion.priority)
    ) {
      best = { promotion, amount }
    }
  }

  const amount = best ? best.amount : item.priceAmount
  return {
    amount,
    baseAmount: item.priceAmount,
    currency: item.currency,
    appliedPromotion: best ? { id: best.promotion.id, title: best.promotion.title } : null,
    discountAmount: item.priceAmount - amount,
  }
}

/** Promotions à afficher (bannière, page Offres), y compris « affichage seul ». */
export function getActivePromotions<T extends Promotion>(promotions: T[], date: Date): T[] {
  return promotions
    .filter((p) => isPromotionActive(p, date))
    .sort((a, b) => b.priority - a.priority)
}
