import type {
  DOCUMENT_TYPES,
  PaymentNumber,
  PROGRAM_STATUSES,
  ProductVariants,
  SocialLinks,
  SuggestedAmount,
} from '@/db/schema'
import type { Currency, Promotion } from '@/lib/pricing/types'

export interface SiteSettings {
  organizationName: string
  acronym: string | null
  tagline: string | null
  legalStatus: string | null
  registrationNumber: string | null
  address: string | null
  googleMapsUrl: string | null
  phone: string | null
  whatsappNumber: string
  emails: string[]
  socialLinks: SocialLinks
  paymentNumbers: PaymentNumber[]
  bankDetails: string | null
  donationAmounts: SuggestedAmount[]
}

export interface Program {
  id: string
  slug: string
  title: string
  summary: string | null
  content: string | null
  coverImageUrl: string | null
  /** Vide si l'autorisation de diffusion des photos n'est pas cochée. */
  gallery: string[]
  areas: string | null
  beneficiaries: string | null
  status: (typeof PROGRAM_STATUSES)[number]
}

export interface ImpactMetric {
  id: string
  label: string
  value: number
  unit: string | null
  period: string | null
  programId: string | null
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  imageUrl: string | null
}

export interface Product {
  id: string
  slug: string
  name: string
  description: string | null
  packaging: string | null
  composition: string | null
  usageTips: string | null
  categoryId: string | null
  /** null = prix à confirmer. */
  priceAmount: number | null
  currency: Currency
  compareAtAmount: number | null
  stock: number | null
  variants: ProductVariants
  images: string[]
  programId: string | null
  isFeatured: boolean
}

/** Promotion avec ses textes d'affichage (bannière, page Offres). */
export interface PromotionCard extends Promotion {
  subtitle: string | null
  description: string | null
  badge: string | null
  bannerUrl: string | null
  ctaLabel: string | null
  ctaHref: string | null
  showBanner: boolean
}

export interface Post {
  id: string
  slug: string
  title: string
  excerpt: string | null
  content: string | null
  imageUrl: string | null
  programId: string | null
  /** ISO 8601 */
  publishedAt: string
  seoTitle: string | null
  seoDescription: string | null
}

export interface FoundationDocument {
  id: string
  title: string
  type: (typeof DOCUMENT_TYPES)[number]
  year: number | null
  fileUrl: string
  fileSizeBytes: number
  description: string | null
}

export interface TeamMember {
  id: string
  fullName: string
  role: string
  photoUrl: string | null
  bio: string | null
}

export interface Partner {
  id: string
  name: string
  logoUrl: string | null
  websiteUrl: string | null
}

export interface Testimonial {
  id: string
  displayName: string
  body: string
  programTitle: string | null
}

export interface PageSection {
  key: string
  title: string | null
  subtitle: string | null
  body: string | null
  imageUrl: string | null
  secondaryImageUrl: string | null
  buttonLabel: string | null
  buttonHref: string | null
}
