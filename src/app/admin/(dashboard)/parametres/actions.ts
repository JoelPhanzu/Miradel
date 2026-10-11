'use server'

import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { getDb, schema } from '@/db'
import type { PaymentNumber, SocialLinks, SuggestedAmount } from '@/db/schema'
import {
  audit,
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
import { normalizeCongoPhone } from '@/lib/phone'

const SOCIALS = ['facebook', 'instagram', 'tiktok', 'youtube', 'linkedin', 'x'] as const

const url = z.url({ message: 'Lien invalide (doit commencer par https://)' })

/** « 5 000 » (FC) ou « 12,50 » (USD) -> montant stocké (FC, ou cents). null si invalide. */
function parseAmount(raw: string, currency: 'CDF' | 'USD'): number | null {
  const value = Number(raw.replace(/[\s  ]/g, '').replace(',', '.'))
  if (!Number.isFinite(value) || value <= 0) return null
  return currency === 'USD' ? Math.round(value * 100) : Math.round(value)
}

export async function saveSettings(_state: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireUser()
  const errors: Record<string, string> = {}

  const organizationName = text(fd, 'organizationName')
  if (!organizationName) errors.organizationName = 'Indiquez le nom de la fondation'

  const whatsapp = normalizeCongoPhone(text(fd, 'whatsappNumber'))
  if (!whatsapp) errors.whatsappNumber = 'Numéro WhatsApp invalide (ex. 0811 708 299)'

  const phoneRaw = text(fd, 'phone')
  const phone = phoneRaw ? normalizeCongoPhone(phoneRaw) : null
  if (phoneRaw && !phone) errors.phone = 'Numéro invalide'

  const emails = jsonField<string[]>(fd, 'emails', [])
  if (emails.some((e) => !z.email().safeParse(e).success))
    errors.emails = 'Une adresse e-mail est invalide'

  const googleMapsUrl = optionalText(fd, 'googleMapsUrl')
  if (googleMapsUrl && !url.safeParse(googleMapsUrl).success) errors.googleMapsUrl = 'Lien invalide'

  const socialLinks: SocialLinks = {}
  for (const key of SOCIALS) {
    const value = optionalText(fd, `social_${key}`)
    if (value && !url.safeParse(value).success)
      errors[`social_${key}`] = 'Lien invalide (https://…)'
    socialLinks[key] = value
  }

  const paymentNumbers = jsonField<PaymentNumber[]>(fd, 'paymentNumbers', [])
    .map((p) => ({ provider: p.provider.trim(), number: p.number.trim(), holder: p.holder.trim() }))
    .filter((p) => p.provider || p.number)
  if (paymentNumbers.some((p) => !p.provider || !p.number)) {
    errors.paymentNumbers = 'Indiquez l’opérateur et le numéro sur chaque ligne'
  }

  const donationAmounts: SuggestedAmount[] = []
  for (const currency of ['CDF', 'USD'] as const) {
    for (const raw of jsonField<string[]>(fd, `donation_${currency}`, [])) {
      const amount = parseAmount(raw, currency)
      if (amount === null) errors[`donation_${currency}`] = `Montant invalide : « ${raw} »`
      else donationAmounts.push({ amount, currency })
    }
  }

  const usdToCdfRate = optionalInt(fd, 'usdToCdfRate')
  if (usdToCdfRate !== null && usdToCdfRate <= 0) errors.usdToCdfRate = 'Taux invalide'

  if (Object.keys(errors).length) return failure(errors)

  const values = {
    organizationName,
    acronym: optionalText(fd, 'acronym'),
    tagline: optionalText(fd, 'tagline'),
    legalStatus: optionalText(fd, 'legalStatus'),
    registrationNumber: optionalText(fd, 'registrationNumber'),
    address: optionalText(fd, 'address'),
    googleMapsUrl,
    phone,
    whatsappNumber: whatsapp!.replace('+', ''),
    emails,
    socialLinks,
    paymentNumbers,
    bankDetails: optionalText(fd, 'bankDetails'),
    donationAmounts,
    usdToCdfRate,
  }

  const db = getDb()
  const [before] = await db.select().from(schema.settings).where(eq(schema.settings.id, 1))
  if (before) await db.update(schema.settings).set(values).where(eq(schema.settings.id, 1))
  else await db.insert(schema.settings).values({ id: 1, ...values })

  await audit('settings', null, before ? 'UPDATE' : 'INSERT', user.id, before ?? null, values)
  refresh([CACHE_TAGS.settings], '/admin/parametres')
  return success('Paramètres enregistrés')
}
