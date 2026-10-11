import type { Currency } from './pricing/types'
import { KINSHASA_TIME_ZONE } from './pricing'

const NBSP = ' '

const groupFormatter = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 })
const centsFormatter = new Intl.NumberFormat('fr-FR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/** Remplace les espaces fines de Intl par des espaces insécables classiques. */
function withNbsp(value: string): string {
  return value.replace(/[  \s]/g, NBSP)
}

/**
 * Montant affichable : « 5 000 FC » ou « 12,50 USD » (devise toujours visible).
 * CDF : montant en francs. USD : montant en cents.
 */
export function formatAmount(amount: number, currency: Currency): string {
  if (currency === 'USD') return `${withNbsp(centsFormatter.format(amount / 100))}${NBSP}USD`
  return `${withNbsp(groupFormatter.format(amount))}${NBSP}FC`
}

/** Nombre avec séparateur de milliers (« 1 250 »), pour les chiffres d'impact. */
export function formatNumber(value: number): string {
  return withNbsp(groupFormatter.format(value))
}

const dateTimeFormatter = new Intl.DateTimeFormat('fr-FR', {
  timeZone: KINSHASA_TIME_ZONE,
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
})

/** « 13 oct., 14:05 », à l'heure de Kinshasa (listes de l'admin). */
export function formatDateTime(date: Date): string {
  return dateTimeFormatter.format(date)
}

/** « +243811708299 » -> « +243 811 708 299 ». */
export function formatPhone(phone: string): string {
  return phone.replace(/^\+243(\d{3})(\d{3})(\d{3})$/, '+243 $1 $2 $3')
}

/** Taille d'un fichier affichée à côté du lien de téléchargement : « 850 Ko », « 2,4 Mo ». */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))}${NBSP}Ko`
  const mo = bytes / (1024 * 1024)
  return `${withNbsp(mo.toLocaleString('fr-FR', { maximumFractionDigits: 1 }))}${NBSP}Mo`
}
