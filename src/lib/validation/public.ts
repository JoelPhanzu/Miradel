import { z } from 'zod'
import { CURRENCIES, DONATION_METHODS, MESSAGE_KINDS } from '@/db/schema'
import { normalizeCongoPhone } from '../phone'

export const phoneField = z
  .string()
  .trim()
  .transform((value, ctx) => {
    const normalized = normalizeCongoPhone(value)
    if (!normalized) {
      ctx.addIssue({ code: 'custom', message: 'Numéro invalide (ex. 0811 708 299)' })
      return z.NEVER
    }
    return normalized
  })

const optionalPhone = z
  .string()
  .trim()
  .max(30)
  .optional()
  .default('')
  .transform((value, ctx) => {
    if (!value) return null
    const normalized = normalizeCongoPhone(value)
    if (!normalized) {
      ctx.addIssue({ code: 'custom', message: 'Numéro invalide (ex. 0811 708 299)' })
      return z.NEVER
    }
    return normalized
  })

const optionalEmail = z
  .string()
  .trim()
  .toLowerCase()
  .max(191)
  .optional()
  .default('')
  .refine((v) => !v || z.email().safeParse(v).success, 'Adresse e-mail invalide')
  .transform((v) => v || null)

const name = z.string().trim().min(2, 'Indiquez votre nom').max(120)

export const orderSchema = z
  .object({
    customerName: name,
    customerPhone: phoneField,
    deliveryMode: z.enum(['livraison', 'retrait']),
    deliveryCommune: z.string().trim().max(80).optional().default(''),
    deliveryAddress: z.string().trim().max(255).optional().default(''),
    paymentMethod: z.enum(['mobile_money', 'cash_livraison', 'virement', 'sur_place']),
    message: z.string().trim().max(1000).optional().default(''),
    items: z
      .array(
        z.object({
          productId: z.string().min(1).max(64),
          quantity: z.number().int().min(1).max(50),
          variant: z.record(z.string().max(40), z.string().max(60)).optional().default({}),
        }),
      )
      .min(1, 'Votre panier est vide')
      .max(30),
  })
  .refine((o) => o.deliveryMode === 'retrait' || o.deliveryCommune.length > 0, {
    path: ['deliveryCommune'],
    message: 'Indiquez la commune de livraison',
  })
  .refine((o) => o.paymentMethod !== 'cash_livraison' || o.deliveryMode === 'livraison', {
    path: ['paymentMethod'],
    message: 'Le paiement à la livraison suppose une livraison',
  })

export type OrderInput = z.input<typeof orderSchema>

export const donationSchema = z
  .object({
    isAnonymous: z.boolean().optional().default(false),
    donorName: z.string().trim().max(120).optional().default(''),
    donorPhone: phoneField,
    donorEmail: optionalEmail,
    amount: z.number().int('Montant invalide').positive('Indiquez le montant du don').max(2_000_000_000),
    currency: z.enum(CURRENCIES),
    paymentMethod: z.enum(DONATION_METHODS),
    transactionReference: z.string().trim().max(80).optional().default(''),
    programSlug: z.string().trim().max(180).optional().default(''),
    message: z.string().trim().max(1000).optional().default(''),
  })
  .refine((d) => d.isAnonymous || d.donorName.length >= 2, {
    path: ['donorName'],
    message: 'Indiquez votre nom ou cochez « Don anonyme »',
  })

export type DonationInput = z.input<typeof donationSchema>

export const contactSchema = z
  .object({
    kind: z.enum(MESSAGE_KINDS),
    fullName: name,
    phone: optionalPhone,
    email: optionalEmail,
    organization: z.string().trim().max(160).optional().default(''),
    message: z.string().trim().min(5, 'Écrivez votre message').max(3000),
  })
  .refine((m) => m.phone || m.email, {
    path: ['phone'],
    message: 'Indiquez un téléphone ou une adresse e-mail pour vous répondre',
  })

export type ContactInput = z.input<typeof contactSchema>

export const newsletterSchema = z.object({
  email: z.string().trim().toLowerCase().max(191).pipe(z.email('Adresse e-mail invalide')),
  consent: z.literal(true, 'Cochez la case pour accepter de recevoir nos nouvelles'),
})
