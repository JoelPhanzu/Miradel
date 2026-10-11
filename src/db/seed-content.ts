/**
 * Remplit une base vide avec les contenus de départ (seed-data.ts).
 * Utilisé au démarrage du site (bootstrap.ts) et par le script db/seed.ts.
 */
import type { MySql2Database } from 'drizzle-orm/mysql2'
import * as schema from './schema'
import {
  seedPageSections,
  seedProductCategories,
  seedProducts,
  seedPrograms,
  seedSettings,
  TO_COMPLETE,
} from './seed-data'

/** Renvoie false si la base contenait déjà des paramètres (rien n'est modifié). */
export async function seedContentIfEmpty(db: MySql2Database<typeof schema>): Promise<boolean> {
  const existing = await db.select({ id: schema.settings.id }).from(schema.settings).limit(1)
  if (existing.length > 0) return false

  await db.transaction(async (tx) => {
    await tx.insert(schema.settings).values({ id: 1, ...seedSettings, defaultCurrency: 'CDF' })

    await tx.insert(schema.programs).values(
      seedPrograms.map((p, i) => ({
        ...p,
        content: TO_COMPLETE,
        areas: TO_COMPLETE,
        beneficiaries: TO_COMPLETE,
        gallery: [],
        status: 'en_cours' as const,
        position: i + 1,
        isPublished: true,
      })),
    )

    const categoryIds: Record<string, string> = Object.fromEntries(
      seedProductCategories.map((c) => [c.key, crypto.randomUUID()]),
    )
    await tx.insert(schema.productCategories).values(
      seedProductCategories.map((c, i) => ({
        id: categoryIds[c.key],
        name: c.name,
        slug: c.slug,
        position: i + 1,
      })),
    )
    await tx.insert(schema.products).values(
      seedProducts.map(([category, name, slug], i) => ({
        categoryId: categoryIds[category],
        name,
        slug,
        description: TO_COMPLETE,
        packaging: TO_COMPLETE,
        // Prix de l'ancien site manifestement faux (« Fr 3,00 » à « Fr 8,00 ») : non repris.
        priceAmount: null,
        currency: 'CDF' as const,
        variants: {},
        images: [],
        isPublished: true,
        isFeatured: true,
        position: i + 1,
      })),
    )

    await tx.insert(schema.pageSections).values(seedPageSections)
  })
  return true
}
