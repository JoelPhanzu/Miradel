import { describe, expect, it } from 'vitest'
import type { Entrepreneur, Product } from '@/types/content'
import { filterProducts, isCartProduct, normalizeSearch, sellerWhatsApp } from './vitrine'

const entrepreneur = (id: string, patch: Partial<Entrepreneur> = {}): Entrepreneur => ({
  id,
  slug: id,
  name: id,
  ownerName: null,
  sectorId: null,
  programId: null,
  tagline: null,
  story: null,
  location: null,
  photoUrl: null,
  coverImageUrl: null,
  whatsappNumber: null,
  facebookUrl: null,
  isFoundation: false,
  isFeatured: false,
  ...patch,
})

const product = (id: string, patch: Partial<Product> = {}): Product => ({
  id,
  slug: id,
  name: id,
  description: null,
  packaging: null,
  composition: null,
  usageTips: null,
  categoryId: null,
  entrepreneurId: null,
  priceAmount: null,
  currency: 'CDF',
  compareAtAmount: null,
  stock: null,
  variants: {},
  images: [],
  programId: null,
  isFeatured: false,
  ...patch,
})

const fondation = entrepreneur('fondation', { isFoundation: true })
const couture = entrepreneur('atelier', {
  name: 'Atelier Neema',
  sectorId: 'sec-textile',
  whatsappNumber: '243990000000',
})
const entrepreneurs = [fondation, couture]
const categories = [
  { id: 'cat-hyg', slug: 'hygiene', name: 'Hygiène' },
  { id: 'cat-hab', slug: 'habillement', name: 'Habillement' },
]
const sectors = [{ id: 'sec-textile', slug: 'textile' }]
const products = [
  product('savon', { name: 'Savon lessive', categoryId: 'cat-hyg', entrepreneurId: 'fondation' }),
  product('pagne', { name: 'Robe en pagne', categoryId: 'cat-hab', entrepreneurId: 'atelier' }),
  product('ancien', { name: 'Yaourt Naturel' }),
]
const context = { entrepreneurs, categories, sectors }
const ids = (list: Product[]) => list.map((p) => p.id)

describe('filterProducts', () => {
  it('cherche sans tenir compte des accents ni des majuscules, y compris dans la catégorie', () => {
    expect(ids(filterProducts(products, { q: 'HYGIENE' }, context))).toEqual(['savon'])
    expect(ids(filterProducts(products, { q: 'neema robe' }, context))).toEqual(['pagne'])
    expect(ids(filterProducts(products, { q: '  ' }, context))).toEqual([
      'savon',
      'pagne',
      'ancien',
    ])
  })
  it('filtre par catégorie et par secteur du vendeur', () => {
    expect(ids(filterProducts(products, { categorie: 'habillement' }, context))).toEqual(['pagne'])
    expect(ids(filterProducts(products, { secteur: 'textile' }, context))).toEqual(['pagne'])
    expect(ids(filterProducts(products, { categorie: 'inconnue' }, context))).toEqual([])
  })
})

describe('règles de commande', () => {
  it('panier pour les produits de la fondation (ou sans vendeur), WhatsApp direct sinon', () => {
    expect(isCartProduct(products[0], entrepreneurs)).toBe(true)
    expect(isCartProduct(products[1], entrepreneurs)).toBe(false)
    expect(isCartProduct(products[2], entrepreneurs)).toBe(true)
  })
  it('écrit à l’entrepreneur, ou à la fondation s’il n’a pas de numéro', () => {
    expect(sellerWhatsApp(couture, '243811708299')).toBe('243990000000')
    expect(sellerWhatsApp(entrepreneur('x'), '243811708299')).toBe('243811708299')
    expect(sellerWhatsApp(fondation, '243811708299')).toBe('243811708299')
  })
  it('normalise la recherche', () => {
    expect(normalizeSearch('  Désinfectant ')).toBe('desinfectant')
  })
})
