/**
 * Enregistrement des envois publics : commandes, déclarations de don, messages, newsletter.
 * Les prix sont TOUJOURS recalculés ici (getEffectivePrice), jamais repris du navigateur.
 * Si l'enregistrement échoue (coupure), WhatsApp s'ouvre quand même : aucune vente ni aucun
 * don perdu (CLAUDE.md §7).
 */
import 'server-only'
import { eq } from 'drizzle-orm'
import { getDb, isDatabaseConfigured, schema } from '@/db'
import {
  getPromotions,
  getPublishedProducts,
  getPublishedPrograms,
  getSiteSettings,
} from '@/lib/data/public'
import {
  buildDonationMessage,
  buildOrderMessage,
  DONATION_METHOD_LABELS,
  PAYMENT_LABELS,
} from '@/lib/messages'
import { productPrice } from '@/lib/pricing/items'
import type { EffectivePrice } from '@/lib/pricing/types'
import { generateReference } from '@/lib/reference'
import {
  contactSchema,
  donationSchema,
  newsletterSchema,
  orderSchema,
} from '@/lib/validation/public'
import { buildWhatsAppUrl } from '@/lib/whatsapp'
import type { Product } from '@/types/content'

export type SubmitResult =
  | { ok: true; reference: string | null; whatsappUrl: string; saved: boolean }
  | { ok: false; status: number; errors: Record<string, string> }

export type SimpleResult = { ok: true } | { ok: false; status: number; errors: Record<string, string> }

function fieldErrors(issues: { path: PropertyKey[]; message: string }[]): Record<string, string> {
  const errors: Record<string, string> = {}
  for (const issue of issues) {
    const key = String(issue.path[0] ?? 'form')
    errors[key] ??= issue.message
  }
  return errors
}

/** Insère avec une référence unique (nouvel essai en cas de collision). */
async function withUniqueReference<T>(prefix: 'C' | 'D', insert: (ref: string) => Promise<T>) {
  for (let attempt = 0; attempt < 4; attempt++) {
    const reference = generateReference(prefix)
    try {
      await insert(reference)
      return reference
    } catch (error) {
      const duplicate = (error as { code?: string }).code === 'ER_DUP_ENTRY'
      if (!duplicate || attempt === 3) throw error
    }
  }
  throw new Error('Référence introuvable')
}

// ---------------------------------------------------------------------------
// Commande boutique
// ---------------------------------------------------------------------------

export async function createOrder(input: unknown): Promise<SubmitResult> {
  const parsed = orderSchema.safeParse(input)
  if (!parsed.success) return { ok: false, status: 422, errors: fieldErrors(parsed.error.issues) }
  const data = parsed.data

  const [products, promotions, settings] = await Promise.all([
    getPublishedProducts(),
    getPromotions(),
    getSiteSettings(),
  ])
  const now = new Date()

  const lines: { product: Product; item: (typeof data.items)[number]; price: EffectivePrice }[] =
    []
  for (const item of data.items) {
    const product = products.find((p) => p.id === item.productId)
    if (!product) {
      return {
        ok: false,
        status: 422,
        errors: { items: 'Un produit du panier n’est plus disponible' },
      }
    }
    if (product.stock !== null && product.stock < item.quantity) {
      return {
        ok: false,
        status: 422,
        errors: { items: `Stock insuffisant pour « ${product.name} »` },
      }
    }
    // La quantité compte : une réduction par quantité s'applique à partir d'un seuil.
    const price = productPrice(product, promotions, now, item.quantity)
    if (!price) {
      return {
        ok: false,
        status: 422,
        errors: { items: `Le prix de « ${product.name} » n’est pas encore confirmé` },
      }
    }
    lines.push({ product, item, price })
  }

  const currency = lines[0].price.currency
  if (lines.some((l) => l.price.currency !== currency)) {
    return { ok: false, status: 422, errors: { items: 'Panier en devises différentes' } }
  }
  const totalAmount = lines.reduce((sum, l) => sum + l.price.amount * l.item.quantity, 0)
  const isDelivery = data.deliveryMode === 'livraison'

  let reference: string | null = null
  if (isDatabaseConfigured()) {
    try {
      const db = getDb()
      reference = await withUniqueReference('C', (ref) =>
        db.transaction(async (tx) => {
          const orderId = crypto.randomUUID()
          await tx.insert(schema.orders).values({
            id: orderId,
            reference: ref,
            customerName: data.customerName,
            customerPhone: data.customerPhone,
            deliveryMode: data.deliveryMode,
            deliveryCommune: isDelivery ? data.deliveryCommune || null : null,
            deliveryAddress: isDelivery ? data.deliveryAddress || null : null,
            totalAmount,
            currency,
            paymentMethod: data.paymentMethod,
            message: data.message || null,
          })
          await tx.insert(schema.orderItems).values(
            lines.map(({ product, item, price }) => ({
              orderId,
              productId: product.id,
              productName: product.name,
              variant: item.variant,
              quantity: item.quantity,
              unitPriceAmount: price.amount,
              discountAmount: price.discountAmount,
              promotionId: price.appliedPromotion?.id ?? null,
              currency,
            })),
          )
        }),
      )
    } catch (error) {
      console.error('[commande] enregistrement impossible', error)
    }
  }

  const message = buildOrderMessage({
    organizationName: settings.organizationName,
    reference,
    customerName: data.customerName,
    customerPhone: data.customerPhone,
    deliveryMode: data.deliveryMode,
    deliveryCommune: isDelivery ? data.deliveryCommune : null,
    deliveryAddress: isDelivery ? data.deliveryAddress : null,
    paymentLabel: PAYMENT_LABELS[data.paymentMethod],
    message: data.message,
    lines: lines.map(({ product, item, price }) => ({
      name: product.name,
      variant: item.variant,
      quantity: item.quantity,
      unitAmount: price.amount,
    })),
    totalAmount,
    currency,
  })

  return {
    ok: true,
    reference,
    saved: reference !== null,
    whatsappUrl: buildWhatsAppUrl(settings.whatsappNumber, message),
  }
}

// ---------------------------------------------------------------------------
// Déclaration de don (la fondation confirme la réception dans l'admin)
// ---------------------------------------------------------------------------

export async function createDonation(input: unknown): Promise<SubmitResult> {
  const parsed = donationSchema.safeParse(input)
  if (!parsed.success) return { ok: false, status: 422, errors: fieldErrors(parsed.error.issues) }
  const data = parsed.data

  const [programs, settings] = await Promise.all([getPublishedPrograms(), getSiteSettings()])
  const program = data.programSlug ? programs.find((p) => p.slug === data.programSlug) : null
  if (data.programSlug && !program) {
    return { ok: false, status: 422, errors: { programSlug: 'Programme inconnu' } }
  }
  // Montant déjà en entiers : FC, ou cents pour l'USD (conversion faite par le formulaire).
  const donorName = data.isAnonymous ? null : data.donorName

  let reference: string | null = null
  if (isDatabaseConfigured()) {
    try {
      reference = await withUniqueReference('D', (ref) =>
        getDb()
          .insert(schema.donations)
          .values({
            reference: ref,
            isAnonymous: data.isAnonymous,
            donorName,
            donorPhone: data.donorPhone,
            donorEmail: data.donorEmail,
            amount: data.amount,
            currency: data.currency,
            paymentMethod: data.paymentMethod,
            transactionReference: data.transactionReference || null,
            programId: program?.id ?? null,
            message: data.message || null,
          }),
      )
    } catch (error) {
      console.error('[don] enregistrement impossible', error)
    }
  }

  const message = buildDonationMessage({
    organizationName: settings.organizationName,
    reference,
    donorName,
    amount: data.amount,
    currency: data.currency,
    methodLabel: DONATION_METHOD_LABELS[data.paymentMethod],
    transactionReference: data.transactionReference,
    programTitle: program?.title,
  })
  return {
    ok: true,
    reference,
    saved: reference !== null,
    whatsappUrl: buildWhatsAppUrl(settings.whatsappNumber, message),
  }
}

// ---------------------------------------------------------------------------
// Contact, bénévolat, partenariat
// ---------------------------------------------------------------------------

export async function createContactMessage(input: unknown): Promise<SimpleResult> {
  const parsed = contactSchema.safeParse(input)
  if (!parsed.success) return { ok: false, status: 422, errors: fieldErrors(parsed.error.issues) }
  const data = parsed.data
  if (!isDatabaseConfigured()) {
    return { ok: false, status: 503, errors: { form: 'Envoi indisponible. Écrivez-nous sur WhatsApp.' } }
  }
  try {
    await getDb()
      .insert(schema.contactMessages)
      .values({
        kind: data.kind,
        fullName: data.fullName,
        phone: data.phone,
        email: data.email,
        organization: data.organization || null,
        message: data.message,
      })
    return { ok: true }
  } catch (error) {
    console.error('[message] enregistrement impossible', error)
    return {
      ok: false,
      status: 500,
      errors: { form: 'Envoi impossible pour le moment. Écrivez-nous sur WhatsApp.' },
    }
  }
}

// ---------------------------------------------------------------------------
// Newsletter (l'envoi est hors périmètre : export CSV depuis l'admin)
// ---------------------------------------------------------------------------

export async function subscribeNewsletter(input: unknown): Promise<SimpleResult> {
  const parsed = newsletterSchema.safeParse(input)
  if (!parsed.success) return { ok: false, status: 422, errors: fieldErrors(parsed.error.issues) }
  if (!isDatabaseConfigured()) {
    return { ok: false, status: 503, errors: { form: 'Inscription indisponible pour le moment.' } }
  }
  const { email } = parsed.data
  try {
    const db = getDb()
    const [existing] = await db
      .select({ id: schema.newsletterSubscribers.id })
      .from(schema.newsletterSubscribers)
      .where(eq(schema.newsletterSubscribers.email, email))
    if (existing) {
      // Réinscription : le consentement est renouvelé.
      await db
        .update(schema.newsletterSubscribers)
        .set({ consent: true, unsubscribedAt: null })
        .where(eq(schema.newsletterSubscribers.id, existing.id))
    } else {
      await db.insert(schema.newsletterSubscribers).values({ email, consent: true })
    }
    return { ok: true }
  } catch (error) {
    console.error('[newsletter] inscription impossible', error)
    return { ok: false, status: 500, errors: { form: 'Inscription impossible pour le moment.' } }
  }
}
