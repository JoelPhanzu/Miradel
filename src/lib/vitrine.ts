/**
 * Vitrine de l'entrepreneur : recherche et classement des produits, et règles de commande.
 *
 * Règle de commande (à confirmer par la fondation, voir docs/a-completer.md) :
 * - produits de la FONDATION : panier + commande enregistrée + WhatsApp de la fondation ;
 * - produits d'un ENTREPRENEUR accompagné : pas de panier ; le visiteur écrit directement
 *   à l'entrepreneur sur WhatsApp (ou à la fondation si l'entrepreneur n'a pas de numéro).
 */
import { formatAmount } from '@/lib/format'
import type { EffectivePrice } from '@/lib/pricing/types'
import { buildWhatsAppUrl } from '@/lib/whatsapp'
import type { Entrepreneur, Product } from '@/types/content'

/** Minuscules sans accents : « Savon » trouve « savon », « hygiene » trouve « Hygiène ». */
export function normalizeSearch(value: string): string {
  // Après décomposition (NFD), les accents sont des marques combinantes (\p{M}) : on les retire.
  return value.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim()
}

/** Vrai si le produit se commande avec le panier (produit de la fondation). */
export function isCartProduct(product: Product, entrepreneurs: Entrepreneur[]): boolean {
  if (!product.entrepreneurId) return true
  return entrepreneurs.find((e) => e.id === product.entrepreneurId)?.isFoundation ?? false
}

export interface ProductFilters {
  q?: string
  /** slug de catégorie */
  categorie?: string
  /** slug de secteur */
  secteur?: string
}

/** Filtre les produits par texte (nom, description, vendeur), catégorie et secteur du vendeur. */
export function filterProducts(
  products: Product[],
  filters: ProductFilters,
  context: {
    entrepreneurs: Entrepreneur[]
    categories: { id: string; slug: string; name: string }[]
    sectors: { id: string; slug: string }[]
  },
): Product[] {
  const words = normalizeSearch(filters.q ?? '')
    .split(/\s+/)
    .filter(Boolean)
  const category = context.categories.find((c) => c.slug === filters.categorie)
  const sector = context.sectors.find((s) => s.slug === filters.secteur)
  const seller = new Map(context.entrepreneurs.map((e) => [e.id, e]))
  const categoryName = new Map(context.categories.map((c) => [c.id, c.name]))

  return products.filter((p) => {
    if (filters.categorie && p.categoryId !== category?.id) return false
    const owner = p.entrepreneurId ? seller.get(p.entrepreneurId) : undefined
    if (filters.secteur && owner?.sectorId !== sector?.id) return false
    if (words.length === 0) return true
    const haystack = normalizeSearch(
      [
        p.name,
        p.description ?? '',
        p.packaging ?? '',
        owner?.name ?? '',
        owner?.ownerName ?? '',
        p.categoryId ? (categoryName.get(p.categoryId) ?? '') : '',
      ].join(' '),
    )
    return words.every((w) => haystack.includes(w))
  })
}

/** Numéro WhatsApp à qui écrire pour un produit (entrepreneur, sinon fondation). */
export function sellerWhatsApp(
  entrepreneur: Entrepreneur | undefined,
  foundationNumber: string,
): string {
  return (!entrepreneur?.isFoundation && entrepreneur?.whatsappNumber) || foundationNumber
}

/** Message WhatsApp pré-rempli pour commander le produit d'un entrepreneur. */
export function sellerOrderMessage(
  productName: string,
  priceText: string | null,
  sellerName: string,
  foundationName: string,
  viaFoundation: boolean,
): string {
  const price = priceText ? ` (${priceText})` : ''
  return viaFoundation
    ? `Bonjour ${foundationName}, je souhaite commander « ${productName} »${price} de ${sellerName}, vu sur votre vitrine.`
    : `Bonjour ${sellerName}, je souhaite commander « ${productName} »${price}, vu sur la vitrine de la ${foundationName}.`
}

/**
 * Comment se vend un produit : vendeur affiché et, pour un entrepreneur, lien WhatsApp direct
 * (null = produit de la fondation, commandé avec le panier).
 */
export function productSale(
  product: Product,
  entrepreneurs: Entrepreneur[],
  settings: { organizationName: string; whatsappNumber: string },
  price: EffectivePrice | null,
): {
  seller: { name: string; slug: string; isFoundation: boolean } | null
  whatsappUrl: string | null
} {
  const owner = entrepreneurs.find((e) => e.id === product.entrepreneurId)
  const seller = owner
    ? { name: owner.name, slug: owner.slug, isFoundation: owner.isFoundation }
    : null
  if (isCartProduct(product, entrepreneurs) || !owner) return { seller, whatsappUrl: null }
  const viaFoundation = !owner.whatsappNumber
  const message = sellerOrderMessage(
    product.name,
    price ? formatAmount(price.amount, price.currency) : null,
    owner.name,
    settings.organizationName,
    viaFoundation,
  )
  return {
    seller,
    whatsappUrl: buildWhatsAppUrl(sellerWhatsApp(owner, settings.whatsappNumber), message),
  }
}
