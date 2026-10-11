import { KINSHASA_TIME_ZONE } from './pricing'

const isoDateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: KINSHASA_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

/** Date du jour à Kinshasa au format AAAA-MM-JJ. */
export function kinshasaDateString(date: Date): string {
  return isoDateFormatter.format(date)
}

const longDateFormatter = new Intl.DateTimeFormat('fr-FR', {
  timeZone: KINSHASA_TIME_ZONE,
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

/** « 13 octobre 2026 », à l'heure de Kinshasa (dates des actualités, des dons…). */
export function formatLongDate(date: Date | string): string {
  return longDateFormatter.format(typeof date === 'string' ? new Date(date) : date)
}
