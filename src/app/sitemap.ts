import type { MetadataRoute } from 'next'
import {
  getProductCategories,
  getPublishedPosts,
  getPublishedPrograms,
  getPublishedProducts,
} from '@/lib/data/public'

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3420'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [programs, products, categories, posts] = await Promise.all([
    getPublishedPrograms(),
    getPublishedProducts(),
    getProductCategories(),
    getPublishedPosts(),
  ])
  const pages = [
    '',
    '/la-fondation',
    '/nos-programmes',
    '/notre-impact',
    '/transparence',
    '/boutique',
    '/promotions',
    '/sengager',
    '/sengager/faire-un-don',
    '/actualites',
    '/contact',
    '/conditions-generales',
    '/politique-de-confidentialite',
  ]
  return [
    ...pages.map((path) => ({ url: `${SITE}${path}`, changeFrequency: 'weekly' as const })),
    ...programs.map((p) => ({ url: `${SITE}/nos-programmes/${p.slug}` })),
    ...categories.map((c) => ({ url: `${SITE}/boutique/c/${c.slug}` })),
    ...products.map((p) => ({ url: `${SITE}/produits/${p.slug}` })),
    ...posts.map((p) => ({ url: `${SITE}/actualites/${p.slug}`, lastModified: p.publishedAt })),
  ]
}
