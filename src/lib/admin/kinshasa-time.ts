/**
 * Conversions pour les champs date-heure de l'admin, saisis à l'heure de Kinshasa
 * (UTC+1, sans heure d'été).
 */
const OFFSET = '+01:00'

/** « 2026-10-13T00:00 » saisi à Kinshasa -> Date (UTC). */
export function parseKinshasaLocal(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return null
  const date = new Date(`${value}:00${OFFSET}`)
  return Number.isNaN(date.getTime()) ? null : date
}

/** Date (UTC) -> « 2026-10-13T00:00 » à l'heure de Kinshasa, pour un champ datetime-local. */
export function toKinshasaLocal(date: Date | null | undefined): string {
  if (!date) return ''
  const shifted = new Date(date.getTime() + 60 * 60 * 1000)
  return shifted.toISOString().slice(0, 16)
}
