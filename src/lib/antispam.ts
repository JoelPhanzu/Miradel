/**
 * Protection légère des formulaires publics, sans CAPTCHA (CLAUDE.md §5) :
 * - un champ piège invisible (« website ») que seuls les robots remplissent ;
 * - un délai minimal entre l'affichage du formulaire et l'envoi.
 */
export const HONEYPOT_FIELD = 'website'
export const STARTED_AT_FIELD = 'startedAt'
export const MIN_FILL_MS = 3_000

export interface AntiSpamFields {
  [HONEYPOT_FIELD]?: unknown
  [STARTED_AT_FIELD]?: unknown
}

/** Vrai si l'envoi ressemble à celui d'un robot. */
export function looksLikeSpam(body: AntiSpamFields, now = Date.now()): boolean {
  if (typeof body[HONEYPOT_FIELD] === 'string' && body[HONEYPOT_FIELD].trim() !== '') return true
  const startedAt = Number(body[STARTED_AT_FIELD])
  if (!Number.isFinite(startedAt) || startedAt <= 0) return true
  return now - startedAt < MIN_FILL_MS
}
