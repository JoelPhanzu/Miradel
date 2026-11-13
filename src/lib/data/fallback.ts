/**
 * Contenus de repli, construits à partir de src/db/seed-data.ts.
 * Utilisés uniquement tant que DATABASE_URL n'est pas renseignée (développement local)
 * ou pendant un build sans accès à la base.
 */
import {
  seedPageSections,
  seedProductCategories,
  seedProducts,
  seedPrograms,
  seedSettings,
  TO_COMPLETE,
} from '@/db/seed-data'
import type {
  Category,
  Entrepreneur,
  PageSection,
  Product,
  Program,
  SiteSettings,
} from '@/types/content'

const FOUNDATION_SEED_ID = 'seed-fondation'

/** La fondation, première vitrine (ses produits se commandent avec le panier). */
export const fallbackEntrepreneurs: Entrepreneur[] = [
  {
    id: FOUNDATION_SEED_ID,
    slug: 'fondation-miradel-fevepa',
    name: seedSettings.organizationName,
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
    isFoundation: true,
    isFeatured: true,
  },
]

export const fallbackSettings: SiteSettings = seedSettings

export const fallbackPrograms: Program[] = seedPrograms.map((p) => ({
  ...p,
  id: `seed-${p.slug}`,
  content: TO_COMPLETE,
  coverImageUrl: null,
  gallery: [],
  areas: TO_COMPLETE,
  beneficiaries: TO_COMPLETE,
  status: 'en_cours',
}))

export const fallbackProductCategories: Category[] = seedProductCategories.map((c) => ({
  id: `seed-${c.key}`,
  name: c.name,
  slug: c.slug,
  description: null,
  imageUrl: null,
}))

export const fallbackProducts: Product[] = seedProducts.map(([category, name, slug]) => ({
  id: `seed-${slug}`,
  slug,
  name,
  description: TO_COMPLETE,
  packaging: TO_COMPLETE,
  composition: null,
  usageTips: null,
  categoryId: `seed-${category}`,
  entrepreneurId: FOUNDATION_SEED_ID,
  priceAmount: null,
  currency: 'CDF',
  compareAtAmount: null,
  stock: null,
  variants: {},
  images: [],
  programId: null,
  isFeatured: true,
}))

export const fallbackPageSections: PageSection[] = seedPageSections.map((s) => ({
  key: s.key,
  title: s.title ?? null,
  subtitle: s.subtitle ?? null,
  body: s.body ?? null,
  imageUrl: null,
  secondaryImageUrl: null,
  gallery: [],
  buttonLabel: s.buttonLabel ?? null,
  buttonHref: s.buttonHref ?? null,
}))
