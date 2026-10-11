import { describe, expect, it } from 'vitest'
import {
  getActivePromotions,
  getEffectivePrice,
  getKinshasaWeekday,
  roundDiscountedAmount,
  type PricedItem,
  type Promotion,
} from '.'
import { productPrice } from './items'
import type { Product } from '@/types/content'

// Prix fictifs, utilisés uniquement par les tests.
const yaourt: PricedItem = {
  id: 'prd-yaourt',
  categoryId: 'cat-agro',
  priceAmount: 25000,
  currency: 'CDF',
}

const detergent: PricedItem = {
  id: 'prd-detergent',
  categoryId: 'cat-hygiene',
  priceAmount: 75000,
  currency: 'CDF',
}

function promo(overrides: Partial<Promotion>): Promotion {
  return {
    id: 'promo',
    title: 'Promo',
    discountType: 'percentage',
    discountValue: 20,
    scope: 'all_products',
    targets: [],
    startsAt: null,
    endsAt: null,
    weekdays: null,
    minQuantity: null,
    isActive: true,
    priority: 0,
    ...overrides,
  }
}

// Le 13 octobre 2026 est un mardi. Kinshasa = UTC+1, sans heure d'été.
const TUESDAY_NOON = new Date('2026-10-13T11:00:00Z')
const WEDNESDAY_NOON = new Date('2026-10-14T11:00:00Z')

const tuesdayOffer = promo({ id: 'mardi', title: 'Offre du mardi', weekdays: [2] })

describe('getKinshasaWeekday', () => {
  it('renvoie le jour ISO à l’heure de Kinshasa', () => {
    expect(getKinshasaWeekday(TUESDAY_NOON)).toBe(2)
    expect(getKinshasaWeekday(WEDNESDAY_NOON)).toBe(3)
    expect(getKinshasaWeekday(new Date('2026-10-11T11:00:00Z'))).toBe(7)
  })
})

describe('getEffectivePrice', () => {
  it('applique une offre du mardi le mardi', () => {
    const price = getEffectivePrice(yaourt, 1, [tuesdayOffer], TUESDAY_NOON)
    expect(price.amount).toBe(20000)
    expect(price.baseAmount).toBe(25000)
    expect(price.discountAmount).toBe(5000)
    expect(price.appliedPromotion?.id).toBe('mardi')
  })

  it('n’applique pas une offre du mardi le mercredi', () => {
    const price = getEffectivePrice(yaourt, 1, [tuesdayOffer], WEDNESDAY_NOON)
    expect(price.amount).toBe(25000)
    expect(price.appliedPromotion).toBeNull()
  })

  it('bascule à minuit heure de Kinshasa, pas à minuit UTC', () => {
    // Lundi 23h30 UTC = mardi 00h30 à Kinshasa : offre active.
    expect(
      getEffectivePrice(yaourt, 1, [tuesdayOffer], new Date('2026-10-12T23:30:00Z')).amount,
    ).toBe(20000)
    // Lundi 22h30 UTC = lundi 23h30 à Kinshasa : pas encore.
    expect(
      getEffectivePrice(yaourt, 1, [tuesdayOffer], new Date('2026-10-12T22:30:00Z')).amount,
    ).toBe(25000)
    // Mardi 23h30 UTC = mercredi 00h30 à Kinshasa : terminée.
    expect(
      getEffectivePrice(yaourt, 1, [tuesdayOffer], new Date('2026-10-13T23:30:00Z')).amount,
    ).toBe(25000)
  })

  it('ignore une promotion expirée ou pas encore commencée', () => {
    const expired = promo({ endsAt: '2026-10-01T00:00:00Z' })
    const future = promo({ startsAt: '2026-11-01T00:00:00Z' })
    expect(getEffectivePrice(yaourt, 1, [expired, future], TUESDAY_NOON).amount).toBe(25000)
  })

  it('ignore une promotion désactivée', () => {
    expect(getEffectivePrice(yaourt, 1, [promo({ isActive: false })], TUESDAY_NOON).amount).toBe(
      25000,
    )
  })

  it('applique une réduction par quantité à partir du seuil seulement', () => {
    const fromSix = promo({ id: 'lot', minQuantity: 6 })
    expect(getEffectivePrice(yaourt, 5, [fromSix], TUESDAY_NOON).amount).toBe(25000)
    expect(getEffectivePrice(yaourt, 6, [fromSix], TUESDAY_NOON).amount).toBe(20000)
    expect(getEffectivePrice(yaourt, 12, [fromSix], TUESDAY_NOON).appliedPromotion?.id).toBe(
      'lot',
    )
  })

  it('ne cumule pas : garde la promotion donnant le prix le plus bas', () => {
    const tenPercent = promo({ id: 'p10', discountValue: 10, priority: 99 })
    const thirtyPercent = promo({ id: 'p30', discountValue: 30, priority: 1 })
    const price = getEffectivePrice(yaourt, 1, [tenPercent, thirtyPercent], TUESDAY_NOON)
    expect(price.amount).toBe(17500)
    expect(price.appliedPromotion?.id).toBe('p30')
  })

  it('à prix égal, garde la priorité la plus haute', () => {
    const percent = promo({ id: 'pct', discountValue: 20, priority: 1 })
    const fixed = promo({
      id: 'fix',
      discountType: 'fixed_amount',
      discountValue: 5000,
      priority: 5,
    })
    expect(
      getEffectivePrice(yaourt, 1, [percent, fixed], TUESDAY_NOON).appliedPromotion?.id,
    ).toBe('fix')
  })

  it('ne descend jamais sous 0 avec un montant fixe supérieur au prix', () => {
    const huge = promo({ discountType: 'fixed_amount', discountValue: 40000 })
    const price = getEffectivePrice(yaourt, 1, [huge], TUESDAY_NOON)
    expect(price.amount).toBe(0)
    expect(price.discountAmount).toBe(25000)
  })

  it('arrondit le prix remisé en FC à la centaine inférieure', () => {
    const item = { ...yaourt, priceAmount: 47650 * 2 }
    const half = promo({ discountValue: 50 })
    expect(getEffectivePrice(item, 1, [half], TUESDAY_NOON).amount).toBe(47600)
  })

  it('ne modifie pas le prix pour une promotion « affichage seul »', () => {
    const display = promo({ discountType: 'display_only', discountValue: 0 })
    const price = getEffectivePrice(yaourt, 1, [display], TUESDAY_NOON)
    expect(price.amount).toBe(25000)
    expect(price.appliedPromotion).toBeNull()
  })

  it('respecte la portée : tous les produits, une catégorie, des produits choisis', () => {
    expect(
      getEffectivePrice(detergent, 1, [promo({ scope: 'all_products' })], TUESDAY_NOON).amount,
    ).toBe(60000)

    const hygiene = promo({
      scope: 'product_category',
      targets: [{ targetType: 'product_category', targetId: 'cat-hygiene' }],
    })
    expect(getEffectivePrice(detergent, 1, [hygiene], TUESDAY_NOON).amount).toBe(60000)
    expect(getEffectivePrice(yaourt, 1, [hygiene], TUESDAY_NOON).amount).toBe(25000)

    const onlyYaourt = promo({
      scope: 'items',
      targets: [{ targetType: 'product', targetId: 'prd-yaourt' }],
    })
    expect(getEffectivePrice(yaourt, 1, [onlyYaourt], TUESDAY_NOON).amount).toBe(20000)
    expect(getEffectivePrice(detergent, 1, [onlyYaourt], TUESDAY_NOON).amount).toBe(75000)
  })

  it('calcule les USD en cents', () => {
    const usd: PricedItem = { ...yaourt, priceAmount: 1250, currency: 'USD' }
    expect(getEffectivePrice(usd, 1, [promo({ discountValue: 10 })], TUESDAY_NOON).amount).toBe(
      1125,
    )
  })
})

describe('productPrice', () => {
  const base: Product = {
    id: 'prd-piment',
    slug: 'piment',
    name: 'Piment',
    description: null,
    packaging: null,
    composition: null,
    usageTips: null,
    categoryId: 'cat-agro',
    priceAmount: 10000,
    currency: 'CDF',
    compareAtAmount: null,
    stock: null,
    variants: {},
    images: [],
    programId: null,
    isFeatured: false,
  }

  it('renvoie null tant que le prix n’est pas confirmé', () => {
    expect(productPrice({ ...base, priceAmount: null }, [], TUESDAY_NOON)).toBeNull()
  })

  it('affiche le prix barré saisi à la main sans promotion', () => {
    const price = productPrice({ ...base, compareAtAmount: 12000 }, [], TUESDAY_NOON)
    expect(price?.amount).toBe(10000)
    expect(price?.baseAmount).toBe(12000)
  })
})

describe('roundDiscountedAmount', () => {
  it('arrondit les FC à la centaine et les cents USD à l’unité', () => {
    expect(roundDiscountedAmount(47650, 'CDF')).toBe(47600)
    expect(roundDiscountedAmount(1999.7, 'USD')).toBe(1999)
  })
})

describe('getActivePromotions', () => {
  it('inclut les promotions « affichage seul » et trie par priorité', () => {
    const display = promo({ id: 'display', discountType: 'display_only', priority: 1 })
    const active = getActivePromotions([display, { ...tuesdayOffer, priority: 10 }], TUESDAY_NOON)
    expect(active.map((p) => p.id)).toEqual(['mardi', 'display'])
    expect(getActivePromotions([tuesdayOffer], WEDNESDAY_NOON)).toEqual([])
  })
})
