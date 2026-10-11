/**
 * Lectures publiques, mises en cache (Cache Components).
 * Seuls les contenus publiés sortent d'ici : c'est la barrière de sécurité de la lecture publique.
 * L'admin invalide ces données avec updateTag(<étiquette>) après chaque enregistrement.
 * Les prix effectifs ne sont PAS calculés ici : ils dépendent de l'heure de Kinshasa
 * et sont calculés à la requête avec getEffectivePrice().
 */
import 'server-only'
import { and, asc, desc, eq, isNotNull, lte } from 'drizzle-orm'
import { cacheLife, cacheTag } from 'next/cache'
import { getDb, isDatabaseConfigured, schema } from '@/db'
import type {
  Category,
  FoundationDocument,
  ImpactMetric,
  PageSection,
  Partner,
  Post,
  Product,
  Program,
  PromotionCard,
  SiteSettings,
  TeamMember,
  Testimonial,
} from '@/types/content'
import {
  fallbackPageSections,
  fallbackProductCategories,
  fallbackProducts,
  fallbackPrograms,
  fallbackSettings,
} from './fallback'

export const CACHE_TAGS = {
  settings: 'settings',
  programs: 'programs',
  impact: 'impact',
  products: 'products',
  promotions: 'promotions',
  posts: 'posts',
  documents: 'documents',
  team: 'team',
  partners: 'partners',
  testimonials: 'testimonials',
  pageSections: 'page-sections',
} as const

export type CacheTag = (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS]

/**
 * Lecture en base avec durée de cache adaptée.
 * Pendant le build seulement, si la base est injoignable (environnement de build isolé),
 * on prérend avec les contenus de départ, revalidés chaque minute : la vraie base
 * prend le relais dès la mise en ligne. En fonctionnement normal, une erreur reste une erreur.
 */
async function fromDb<T>(read: () => Promise<T>, fallback: T): Promise<T> {
  if (!isDatabaseConfigured()) {
    cacheLife('hours')
    return fallback
  }
  try {
    const value = await read()
    cacheLife('hours')
    return value
  } catch (error) {
    if (process.env.NEXT_PHASE !== 'phase-production-build') throw error
    console.warn(
      '[build] base injoignable, contenus de départ utilisés :',
      (error as Error).message,
    )
    cacheLife('minutes')
    return fallback
  }
}

// ---------------------------------------------------------------------------
// Paramètres
// ---------------------------------------------------------------------------

export async function getSiteSettings(): Promise<SiteSettings> {
  'use cache'
  cacheTag(CACHE_TAGS.settings)
  return fromDb(async () => {
    const [row] = await getDb().select().from(schema.settings).where(eq(schema.settings.id, 1))
    if (!row) throw new Error('Paramètres introuvables : la base n’a pas été remplie')
    return {
      organizationName: row.organizationName,
      acronym: row.acronym,
      tagline: row.tagline,
      legalStatus: row.legalStatus,
      registrationNumber: row.registrationNumber,
      address: row.address,
      googleMapsUrl: row.googleMapsUrl,
      phone: row.phone,
      whatsappNumber: row.whatsappNumber,
      emails: row.emails,
      socialLinks: row.socialLinks,
      paymentNumbers: row.paymentNumbers,
      bankDetails: row.bankDetails,
      donationAmounts: row.donationAmounts,
    }
  }, fallbackSettings)
}

// ---------------------------------------------------------------------------
// Programmes et impact
// ---------------------------------------------------------------------------

export async function getPublishedPrograms(): Promise<Program[]> {
  'use cache'
  cacheTag(CACHE_TAGS.programs)
  return fromDb(async () => {
    const rows = await getDb()
      .select()
      .from(schema.programs)
      .where(eq(schema.programs.isPublished, true))
      .orderBy(asc(schema.programs.position))
    return rows.map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      summary: p.summary,
      content: p.content,
      coverImageUrl: p.coverImageUrl,
      // Droit à l'image : galerie publiée seulement avec l'autorisation cochée.
      gallery: p.galleryConsent ? p.gallery : [],
      areas: p.areas,
      beneficiaries: p.beneficiaries,
      status: p.status,
    }))
  }, fallbackPrograms)
}

export async function getProgramBySlug(slug: string): Promise<Program | null> {
  const programs = await getPublishedPrograms()
  return programs.find((p) => p.slug === slug) ?? null
}

/** Chiffres d'impact publiés (la source, interne, n'est jamais lue ici). */
export async function getImpactMetrics(): Promise<ImpactMetric[]> {
  'use cache'
  cacheTag(CACHE_TAGS.impact)
  return fromDb(async () => {
    return getDb()
      .select({
        id: schema.impactMetrics.id,
        label: schema.impactMetrics.label,
        value: schema.impactMetrics.value,
        unit: schema.impactMetrics.unit,
        period: schema.impactMetrics.period,
        programId: schema.impactMetrics.programId,
      })
      .from(schema.impactMetrics)
      .where(eq(schema.impactMetrics.isPublished, true))
      .orderBy(asc(schema.impactMetrics.position))
  }, [])
}

/** Seuls les témoignages publiés AVEC l'accord de la personne sont visibles. */
export async function getTestimonials(): Promise<Testimonial[]> {
  'use cache'
  cacheTag(CACHE_TAGS.testimonials)
  return fromDb(async () => {
    return getDb()
      .select({
        id: schema.testimonials.id,
        displayName: schema.testimonials.displayName,
        body: schema.testimonials.body,
        programTitle: schema.programs.title,
      })
      .from(schema.testimonials)
      .leftJoin(schema.programs, eq(schema.testimonials.programId, schema.programs.id))
      .where(
        and(
          eq(schema.testimonials.isPublished, true),
          eq(schema.testimonials.consentObtained, true),
        ),
      )
      .orderBy(asc(schema.testimonials.position))
  }, [])
}

// ---------------------------------------------------------------------------
// La fondation : équipe, partenaires, documents
// ---------------------------------------------------------------------------

export async function getTeamMembers(): Promise<TeamMember[]> {
  'use cache'
  cacheTag(CACHE_TAGS.team)
  return fromDb(async () => {
    return getDb()
      .select({
        id: schema.teamMembers.id,
        fullName: schema.teamMembers.fullName,
        role: schema.teamMembers.role,
        photoUrl: schema.teamMembers.photoUrl,
        bio: schema.teamMembers.bio,
      })
      .from(schema.teamMembers)
      .where(eq(schema.teamMembers.isPublished, true))
      .orderBy(asc(schema.teamMembers.position))
  }, [])
}

export async function getPartners(): Promise<Partner[]> {
  'use cache'
  cacheTag(CACHE_TAGS.partners)
  return fromDb(async () => {
    return getDb()
      .select({
        id: schema.partners.id,
        name: schema.partners.name,
        logoUrl: schema.partners.logoUrl,
        websiteUrl: schema.partners.websiteUrl,
      })
      .from(schema.partners)
      .where(eq(schema.partners.isPublished, true))
      .orderBy(asc(schema.partners.position))
  }, [])
}

export async function getPublishedDocuments(): Promise<FoundationDocument[]> {
  'use cache'
  cacheTag(CACHE_TAGS.documents)
  return fromDb(async () => {
    return getDb()
      .select({
        id: schema.documents.id,
        title: schema.documents.title,
        type: schema.documents.type,
        year: schema.documents.year,
        fileUrl: schema.documents.fileUrl,
        fileSizeBytes: schema.documents.fileSizeBytes,
        description: schema.documents.description,
      })
      .from(schema.documents)
      .where(eq(schema.documents.isPublished, true))
      .orderBy(asc(schema.documents.position))
  }, [])
}

// ---------------------------------------------------------------------------
// Boutique
// ---------------------------------------------------------------------------

export async function getProductCategories(): Promise<Category[]> {
  'use cache'
  cacheTag(CACHE_TAGS.products)
  return fromDb(async () => {
    return getDb()
      .select({
        id: schema.productCategories.id,
        name: schema.productCategories.name,
        slug: schema.productCategories.slug,
        description: schema.productCategories.description,
        imageUrl: schema.productCategories.imageUrl,
      })
      .from(schema.productCategories)
      .orderBy(asc(schema.productCategories.position))
  }, fallbackProductCategories)
}

export async function getPublishedProducts(): Promise<Product[]> {
  'use cache'
  cacheTag(CACHE_TAGS.products)
  return fromDb(async () => {
    const rows = await getDb()
      .select()
      .from(schema.products)
      .where(eq(schema.products.isPublished, true))
      .orderBy(asc(schema.products.position))
    return rows.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      description: p.description,
      packaging: p.packaging,
      composition: p.composition,
      usageTips: p.usageTips,
      categoryId: p.categoryId,
      priceAmount: p.priceAmount,
      currency: p.currency,
      compareAtAmount: p.compareAtAmount,
      stock: p.stock,
      variants: p.variants,
      images: p.images,
      programId: p.programId,
      isFeatured: p.isFeatured,
    }))
  }, fallbackProducts)
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const products = await getPublishedProducts()
  return products.find((p) => p.slug === slug) ?? null
}

// ---------------------------------------------------------------------------
// Promotions (activées ; les dates et jours sont vérifiés à la requête)
// ---------------------------------------------------------------------------

export async function getPromotions(): Promise<PromotionCard[]> {
  'use cache'
  cacheTag(CACHE_TAGS.promotions)
  return fromDb(async () => {
    const db = getDb()
    const [rows, targets] = await Promise.all([
      db
        .select()
        .from(schema.promotions)
        .where(eq(schema.promotions.isActive, true))
        .orderBy(asc(schema.promotions.position)),
      db.select().from(schema.promotionTargets),
    ])
    return rows.map((p) => ({
      id: p.id,
      title: p.title,
      subtitle: p.subtitle,
      description: p.description,
      badge: p.badge,
      bannerUrl: p.bannerUrl,
      ctaLabel: p.ctaLabel,
      ctaHref: p.ctaHref,
      showBanner: p.showBanner,
      discountType: p.discountType,
      discountValue: p.discountValue,
      scope: p.scope,
      targets: targets
        .filter((t) => t.promotionId === p.id)
        .map((t) => ({ targetType: t.targetType, targetId: t.targetId })),
      startsAt: p.startsAt?.toISOString() ?? null,
      endsAt: p.endsAt?.toISOString() ?? null,
      weekdays: p.weekdays,
      minQuantity: p.minQuantity,
      isActive: p.isActive,
      priority: p.priority,
    }))
  }, [])
}

// ---------------------------------------------------------------------------
// Actualités
// ---------------------------------------------------------------------------

export async function getPublishedPosts(): Promise<Post[]> {
  'use cache'
  cacheTag(CACHE_TAGS.posts)
  return fromDb(async () => {
    // Dans un cache : un article programmé apparaît au plus tard à l'expiration du cache.
    const rows = await getDb()
      .select()
      .from(schema.posts)
      .where(and(isNotNull(schema.posts.publishedAt), lte(schema.posts.publishedAt, new Date())))
      .orderBy(desc(schema.posts.publishedAt))
    return rows.map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      content: p.content,
      imageUrl: p.imageUrl,
      programId: p.programId,
      publishedAt: p.publishedAt!.toISOString(),
      seoTitle: p.seoTitle,
      seoDescription: p.seoDescription,
    }))
  }, [])
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const posts = await getPublishedPosts()
  return posts.find((p) => p.slug === slug) ?? null
}

// ---------------------------------------------------------------------------
// Textes des pages
// ---------------------------------------------------------------------------

export async function getPageSections(): Promise<Record<string, PageSection>> {
  'use cache'
  cacheTag(CACHE_TAGS.pageSections)

  const rows = await fromDb<PageSection[]>(
    () =>
      getDb()
        .select({
          key: schema.pageSections.key,
          title: schema.pageSections.title,
          subtitle: schema.pageSections.subtitle,
          body: schema.pageSections.body,
          imageUrl: schema.pageSections.imageUrl,
          secondaryImageUrl: schema.pageSections.secondaryImageUrl,
          buttonLabel: schema.pageSections.buttonLabel,
          buttonHref: schema.pageSections.buttonHref,
        })
        .from(schema.pageSections),
    fallbackPageSections,
  )
  return Object.fromEntries(rows.map((s) => [s.key, s]))
}
