/**
 * Messages WhatsApp pré-remplis, lisibles par l'équipe de la fondation.
 * Les prix passés ici viennent toujours de getEffectivePrice(), calculé côté serveur.
 */
import type { DELIVERY_MODES, DONATION_METHODS, PAYMENT_METHODS } from '@/db/schema'
import { formatAmount } from './format'
import type { Currency } from './pricing/types'

export const PAYMENT_LABELS: Record<(typeof PAYMENT_METHODS)[number], string> = {
  mobile_money: 'Mobile money',
  cash_livraison: 'Paiement à la livraison (cash)',
  virement: 'Virement bancaire',
  sur_place: 'Paiement au retrait',
}

export type PaymentMethod = keyof typeof PAYMENT_LABELS

export const DELIVERY_LABELS: Record<(typeof DELIVERY_MODES)[number], string> = {
  livraison: 'Livraison',
  retrait: 'Retrait sur place',
}

export type DeliveryMode = keyof typeof DELIVERY_LABELS

export const DONATION_METHOD_LABELS: Record<(typeof DONATION_METHODS)[number], string> = {
  mobile_money: 'Mobile money',
  virement: 'Virement bancaire',
  especes: 'Espèces (remis en main propre)',
}

export type DonationMethod = keyof typeof DONATION_METHOD_LABELS

export interface OrderMessageLine {
  name: string
  variant?: Record<string, string>
  quantity: number
  unitAmount: number
}

export interface OrderMessageInput {
  organizationName: string
  reference: string | null
  customerName: string
  customerPhone: string
  deliveryMode: DeliveryMode
  deliveryCommune?: string | null
  deliveryAddress?: string | null
  paymentLabel: string
  lines: OrderMessageLine[]
  totalAmount: number
  currency: Currency
  message?: string | null
}

export function buildOrderMessage(input: OrderMessageInput): string {
  const items = input.lines.map((line) => {
    const variant = line.variant && Object.values(line.variant).filter(Boolean).join(', ')
    const label = variant ? `${line.name} (${variant})` : line.name
    return `- ${line.quantity} x ${label} : ${formatAmount(line.unitAmount * line.quantity, input.currency)}`
  })
  const lines = [
    `Bonjour ${input.organizationName}, je souhaite passer commande.`,
    '',
    ...items,
    '',
    `Total : ${formatAmount(input.totalAmount, input.currency)}`,
    `Paiement : ${input.paymentLabel}`,
    `Nom : ${input.customerName}`,
    `Téléphone : ${input.customerPhone}`,
  ]
  const place = [input.deliveryCommune, input.deliveryAddress].filter(Boolean).join(', ')
  lines.push(
    `${DELIVERY_LABELS[input.deliveryMode]}${input.deliveryMode === 'livraison' && place ? ` : ${place}` : ''}`,
  )
  if (input.message) lines.push(`Message : ${input.message}`)
  if (input.reference) lines.push('', `Référence : ${input.reference}`)
  return lines.join('\n')
}

export interface DonationMessageInput {
  organizationName: string
  reference: string | null
  donorName: string | null
  amount: number
  currency: Currency
  methodLabel: string
  transactionReference?: string | null
  programTitle?: string | null
}

export function buildDonationMessage(input: DonationMessageInput): string {
  const lines = [
    `Bonjour ${input.organizationName}, je viens de faire un don.`,
    '',
    `Montant : ${formatAmount(input.amount, input.currency)}`,
    `Moyen : ${input.methodLabel}`,
  ]
  if (input.transactionReference) lines.push(`Référence de transaction : ${input.transactionReference}`)
  if (input.programTitle) lines.push(`Programme soutenu : ${input.programTitle}`)
  lines.push(`Nom : ${input.donorName ?? 'Anonyme'}`)
  if (input.reference) lines.push('', `Référence : ${input.reference}`)
  return lines.join('\n')
}
