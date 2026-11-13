import type {
  DOCUMENT_TYPES,
  FormFieldDef,
  VALUE_KINDS,
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
  /** Entrepreneur (ou fondation) qui vend le produit. */
  entrepreneurId: string | null
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
  gallery: string[]
  buttonLabel: string | null
  buttonHref: string | null
}

export interface OrganizationValue {
  id: string
  kind: (typeof VALUE_KINDS)[number]
  title: string
  description: string | null
}

export interface Sector {
  id: string
  name: string
  slug: string
  description: string | null
}

export interface Entrepreneur {
  id: string
  slug: string
  name: string
  ownerName: string | null
  sectorId: string | null
  programId: string | null
  tagline: string | null
  story: string | null
  location: string | null
  /** null si l'accord de diffusion du portrait n'est pas coché. */
  photoUrl: string | null
  coverImageUrl: string | null
  whatsappNumber: string | null
  facebookUrl: string | null
  isFoundation: boolean
  isFeatured: boolean
}

/** Formulaire de participation publié (la date limite est vérifiée à la requête). */
export interface ProgramForm {
  id: string
  programId: string
  title: string
  intro: string | null
  fields: FormFieldDef[]
  /** ISO 8601 ; null = pas de date limite saisie (formulaire fermé par prudence). */
  closesAt: string | null
  successMessage: string | null
}
