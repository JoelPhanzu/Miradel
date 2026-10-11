'use server'

import { eq } from 'drizzle-orm'
import { getDb, schema } from '@/db'
import type { ProductVariants } from '@/db/schema'
import { moveItem, nextPosition } from '@/lib/admin/reorder'
import {
  audit,
  checked,
  currencyField,
  failure,
  jsonField,
  optionalInt,
  optionalMoney,
  optionalText,
  refresh,
  success,
  text,
  uniqueSlug,
  type ActionState,
} from '@/lib/admin/server'
import { requireUser } from '@/lib/auth/session'
import { CACHE_TAGS } from '@/lib/data/public'

const TAGS = [CACHE_TAGS.products]

export async function saveProduct(
  id: string | null,
  _state: ActionState,
  fd: FormData,
): Promise<ActionState> {
  const user = await requireUser()
  const errors: Record<string, string> = {}

  const name = text(fd, 'name')
  if (!name) errors.name = 'Indiquez le nom du produit'
  const currency = currencyField(fd)
  // Vide = prix à confirmer (le produit se commande alors sur WhatsApp).
  const priceAmount = optionalMoney(fd, 'priceAmount', currency)
  if (Number.isNaN(priceAmount)) errors.priceAmount = 'Prix invalide (ex. 5 000 ou 12,50)'
  const compareAtAmount = optionalMoney(fd, 'compareAtAmount', currency)
  if (Number.isNaN(compareAtAmount)) errors.compareAtAmount = 'Prix invalide'
  else if (compareAtAmount !== null && priceAmount === null) {
    errors.compareAtAmount = 'Indiquez d’abord le prix de vente'
  } else if (compareAtAmount !== null && priceAmount !== null && compareAtAmount <= priceAmount) {
    errors.compareAtAmount = 'L’ancien prix doit être supérieur au prix actuel'
  }
  const trackStock = checked(fd, 'trackStock')
  const stock = trackStock ? optionalInt(fd, 'stock') : null
  if (trackStock && (stock === null || stock < 0)) errors.stock = 'Indiquez la quantité en stock'
  if (Object.keys(errors).length) return failure(errors)

  const values = {
    name,
    categoryId: optionalText(fd, 'categoryId'),
    description: optionalText(fd, 'description'),
    packaging: optionalText(fd, 'packaging'),
    composition: optionalText(fd, 'composition'),
    usageTips: optionalText(fd, 'usageTips'),
    programId: optionalText(fd, 'programId'),
    priceAmount,
    currency,
    compareAtAmount,
    stock,
    variants: jsonField<ProductVariants>(fd, 'variants', {}),
    images: jsonField<string[]>(fd, 'images', []),
    isPublished: checked(fd, 'isPublished'),
    isFeatured: checked(fd, 'isFeatured'),
  }

  const db = getDb()
  if (id) {
    const [before] = await db.select().from(schema.products).where(eq(schema.products.id, id))
    if (!before) return failure({}, 'Produit introuvable')
    const slug = before.name === name ? before.slug : await uniqueSlug(schema.products, name, id)
    await db
      .update(schema.products)
      .set({ ...values, slug })
      .where(eq(schema.products.id, id))
    await audit('products', id, 'UPDATE', user.id, before, values)
    refresh(TAGS, '/admin/produits')
    return success()
  }

  const newId = crypto.randomUUID()
  await db.insert(schema.products).values({
    ...values,
    id: newId,
    slug: await uniqueSlug(schema.products, name),
    position: await nextPosition(schema.products),
  })
  await audit('products', newId, 'INSERT', user.id, null, values)
  refresh(TAGS, '/admin/produits')
  return success('Produit créé', newId)
}

export async function deleteProduct(id: string): Promise<ActionState> {
  const user = await requireUser()
  const db = getDb()
  const [before] = await db.select().from(schema.products).where(eq(schema.products.id, id))
  await db.delete(schema.products).where(eq(schema.products.id, id))
  await audit('products', id, 'DELETE', user.id, before ?? null, null)
  refresh(TAGS, '/admin/produits')
  return success('Produit supprimé')
}

export async function moveProduct(id: string, direction: 'up' | 'down'): Promise<void> {
  await requireUser()
  if (await moveItem(schema.products, id, direction)) refresh(TAGS)
}
