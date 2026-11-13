'use server'

import { count, eq } from 'drizzle-orm'
import { z } from 'zod'
import { getDb, schema } from '@/db'
import { moveItem, nextPosition } from '@/lib/admin/reorder'
import {
  audit,
  checked,
  failure,
  optionalText,
  refresh,
  success,
  text,
  uniqueSlug,
  type ActionState,
} from '@/lib/admin/server'
import { requireUser } from '@/lib/auth/session'
import { CACHE_TAGS } from '@/lib/data/public'
import { normalizeCongoPhone } from '@/lib/phone'

const table = schema.entrepreneurs
// Les produits dépendent de la vitrine (une vitrine masquée masque ses produits).
const TAGS = [CACHE_TAGS.entrepreneurs, CACHE_TAGS.products]
/** Adresses déjà prises par les pages de la vitrine. */
const RESERVED_SLUGS = ['produits']

export async function saveEntrepreneur(
  id: string | null,
  _state: ActionState,
  fd: FormData,
): Promise<ActionState> {
  const user = await requireUser()
  const errors: Record<string, string> = {}
  const name = text(fd, 'name')
  if (!name) errors.name = 'Indiquez le nom de l’activité'
  const tagline = optionalText(fd, 'tagline')
  if (tagline && tagline.length > 300) errors.tagline = '300 caractères au maximum'
  const rawPhone = text(fd, 'whatsappNumber')
  const phone = rawPhone ? normalizeCongoPhone(rawPhone) : null
  if (rawPhone && !phone) errors.whatsappNumber = 'Numéro invalide (ex. 0811 708 299)'
  const facebookUrl = optionalText(fd, 'facebookUrl')
  if (facebookUrl && !z.url().safeParse(facebookUrl).success) {
    errors.facebookUrl = 'Lien invalide (doit commencer par https://)'
  }
  const photoUrl = optionalText(fd, 'photoUrl')
  const photoConsent = checked(fd, 'photoConsent')
  if (photoUrl && !photoConsent && checked(fd, 'isPublished')) {
    errors.photoConsent =
      'Cochez l’accord de diffusion, ou retirez le portrait : il ne s’affichera pas sans cet accord.'
  }
  if (Object.keys(errors).length) return failure(errors)

  const values = {
    name,
    ownerName: optionalText(fd, 'ownerName'),
    sectorId: optionalText(fd, 'sectorId'),
    programId: optionalText(fd, 'programId'),
    tagline,
    story: optionalText(fd, 'story'),
    location: optionalText(fd, 'location'),
    photoUrl,
    photoConsent,
    coverImageUrl: optionalText(fd, 'coverImageUrl'),
    // Même format que le numéro WhatsApp de la fondation : chiffres seuls (243…).
    whatsappNumber: phone ? phone.replace('+', '') : null,
    facebookUrl,
    isPublished: checked(fd, 'isPublished'),
    isFeatured: checked(fd, 'isFeatured'),
  }

  const slugFor = async (excludeId?: string) => {
    const slug = await uniqueSlug(table, name, excludeId)
    return RESERVED_SLUGS.includes(slug) ? uniqueSlug(table, `${name} vitrine`, excludeId) : slug
  }

  const db = getDb()
  if (id) {
    const [before] = await db.select().from(table).where(eq(table.id, id))
    if (!before) return failure({}, 'Vitrine introuvable')
    const slug = before.name === name ? before.slug : await slugFor(id)
    await db
      .update(table)
      .set({ ...values, slug })
      .where(eq(table.id, id))
    await audit('entrepreneurs', id, 'UPDATE', user.id, before, values)
    refresh(TAGS, '/admin/entrepreneurs')
    return success()
  }
  const newId = crypto.randomUUID()
  await db.insert(table).values({
    ...values,
    id: newId,
    slug: await slugFor(),
    position: await nextPosition(table),
  })
  await audit('entrepreneurs', newId, 'INSERT', user.id, null, values)
  refresh(TAGS, '/admin/entrepreneurs')
  return success('Vitrine créée', newId)
}

/**
 * Suppression refusée tant que la vitrine a des produits : sinon ils passeraient, sans vendeur,
 * dans le panier de la fondation.
 */
export async function deleteEntrepreneur(id: string): Promise<ActionState> {
  const user = await requireUser()
  const db = getDb()
  const [before] = await db.select().from(table).where(eq(table.id, id))
  if (!before) return failure({}, 'Vitrine introuvable')
  if (before.isFoundation)
    return failure({}, 'La vitrine de la fondation ne peut pas être supprimée')
  const [{ n }] = await db
    .select({ n: count() })
    .from(schema.products)
    .where(eq(schema.products.entrepreneurId, id))
  if (Number(n) > 0) {
    return failure(
      {},
      `Cette vitrine a encore ${n} produit(s) : supprimez-les ou masquez plutôt la vitrine.`,
    )
  }
  await db.delete(table).where(eq(table.id, id))
  await audit('entrepreneurs', id, 'DELETE', user.id, before, null)
  refresh(TAGS, '/admin/entrepreneurs')
  return success('Vitrine supprimée')
}

export async function moveEntrepreneur(id: string, direction: 'up' | 'down'): Promise<void> {
  await requireUser()
  if (await moveItem(table, id, direction)) refresh(TAGS)
}
