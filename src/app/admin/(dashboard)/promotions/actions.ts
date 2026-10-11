'use server'

import { eq } from 'drizzle-orm'
import { getDb, schema } from '@/db'
import { parseKinshasaLocal } from '@/lib/admin/kinshasa-time'
import { moveItem, nextPosition } from '@/lib/admin/reorder'
import {
  audit,
  checked,
  failure,
  jsonField,
  optionalInt,
  optionalText,
  refresh,
  success,
  text,
  type ActionState,
} from '@/lib/admin/server'
import { requireUser } from '@/lib/auth/session'
import { CACHE_TAGS } from '@/lib/data/public'
import type { DiscountType, PromotionScope, PromotionTarget } from '@/lib/pricing/types'

// Les promotions modifient les prix des produits.
const TAGS = [CACHE_TAGS.promotions, CACHE_TAGS.products]
const DISCOUNT_TYPES: DiscountType[] = ['percentage', 'fixed_amount', 'display_only']
const SCOPES: PromotionScope[] = ['all_products', 'product_category', 'items']

export async function savePromotion(
  id: string | null,
  _state: ActionState,
  fd: FormData,
): Promise<ActionState> {
  const user = await requireUser()
  const errors: Record<string, string> = {}

  const title = text(fd, 'title')
  if (!title) errors.title = 'Indiquez le nom de la promotion'

  const discountType = text(fd, 'discountType') as DiscountType
  if (!DISCOUNT_TYPES.includes(discountType)) errors.discountType = 'Choisissez un type'
  const discountValue =
    discountType === 'display_only' ? 0 : (optionalInt(fd, 'discountValue') ?? -1)
  if (discountType === 'percentage' && (discountValue <= 0 || discountValue > 100)) {
    errors.discountValue = 'Pourcentage entre 1 et 100'
  }
  if (discountType === 'fixed_amount' && discountValue <= 0) {
    errors.discountValue = 'Indiquez le montant de la réduction en FC'
  }

  const scope = text(fd, 'scope') as PromotionScope
  if (!SCOPES.includes(scope)) errors.scope = 'Choisissez ce qui est concerné'
  const targets = jsonField<PromotionTarget[]>(fd, 'targets', []).filter((t) => {
    if (scope === 'product_category') return t.targetType === 'product_category'
    if (scope === 'items') return t.targetType === 'product'
    return false
  })
  if (['product_category', 'items'].includes(scope) && targets.length === 0) {
    errors.targets = 'Cochez au moins un élément'
  }

  const startsRaw = text(fd, 'startsAt')
  const endsRaw = text(fd, 'endsAt')
  const startsAt = startsRaw ? parseKinshasaLocal(startsRaw) : null
  const endsAt = endsRaw ? parseKinshasaLocal(endsRaw) : null
  if (startsRaw && !startsAt) errors.startsAt = 'Date invalide'
  if (endsRaw && !endsAt) errors.endsAt = 'Date invalide'
  if (startsAt && endsAt && startsAt > endsAt) errors.endsAt = 'La fin doit être après le début'

  const weekdays = jsonField<number[]>(fd, 'weekdays', []).filter((d) => d >= 1 && d <= 7)
  const minQuantity = optionalInt(fd, 'minQuantity')
  if (minQuantity !== null && (minQuantity < 2 || minQuantity > 1000)) {
    errors.minQuantity = 'Quantité entre 2 et 1 000 (ou laissez vide)'
  }

  const ctaHref = optionalText(fd, 'ctaHref')
  if (ctaHref && !ctaHref.startsWith('/') && !ctaHref.startsWith('https://')) {
    errors.ctaHref = 'Lien du site (ex. /boutique) ou adresse https://'
  }
  if (Object.keys(errors).length) return failure(errors)

  const values = {
    title,
    subtitle: optionalText(fd, 'subtitle'),
    description: optionalText(fd, 'description'),
    badge: optionalText(fd, 'badge'),
    bannerUrl: optionalText(fd, 'bannerUrl'),
    discountType,
    discountValue,
    scope,
    startsAt,
    endsAt,
    weekdays: weekdays.length ? weekdays : null,
    minQuantity,
    ctaLabel: optionalText(fd, 'ctaLabel'),
    ctaHref,
    isActive: checked(fd, 'isActive'),
    showBanner: checked(fd, 'showBanner'),
    priority: optionalInt(fd, 'priority') ?? 0,
  }

  const db = getDb()
  const promotionId = id ?? crypto.randomUUID()
  let before: Record<string, unknown> | null = null

  await db.transaction(async (tx) => {
    if (id) {
      ;[before] = await tx.select().from(schema.promotions).where(eq(schema.promotions.id, id))
      await tx.update(schema.promotions).set(values).where(eq(schema.promotions.id, id))
      await tx.delete(schema.promotionTargets).where(eq(schema.promotionTargets.promotionId, id))
    } else {
      await tx
        .insert(schema.promotions)
        .values({ ...values, id: promotionId, position: await nextPosition(schema.promotions) })
    }
    if (targets.length) {
      await tx
        .insert(schema.promotionTargets)
        .values(
          targets.map((t) => ({ promotionId, targetType: t.targetType, targetId: t.targetId })),
        )
    }
  })

  await audit('promotions', promotionId, id ? 'UPDATE' : 'INSERT', user.id, before, {
    ...values,
    targets,
  })
  refresh(TAGS, '/admin/promotions')
  return id ? success() : success('Promotion créée', promotionId)
}

export async function deletePromotion(id: string): Promise<ActionState> {
  const user = await requireUser()
  const db = getDb()
  const [before] = await db.select().from(schema.promotions).where(eq(schema.promotions.id, id))
  await db.delete(schema.promotions).where(eq(schema.promotions.id, id))
  await audit('promotions', id, 'DELETE', user.id, before ?? null, null)
  refresh(TAGS, '/admin/promotions')
  return success('Promotion supprimée')
}

export async function movePromotion(id: string, direction: 'up' | 'down'): Promise<void> {
  await requireUser()
  if (await moveItem(schema.promotions, id, direction)) refresh(TAGS)
}
