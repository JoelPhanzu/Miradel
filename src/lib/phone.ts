/**
 * Normalise un numéro congolais en +243XXXXXXXXX.
 * Accepte 08…, 8…, +243…, 243…, 00243… avec espaces, points ou tirets.
 * Renvoie null si le numéro n'est pas valide.
 */
export function normalizeCongoPhone(input: string): string | null {
  let digits = input.replace(/[\s.\-()]/g, '')
  if (digits.startsWith('+')) digits = digits.slice(1)
  if (!/^\d+$/.test(digits)) return null
  if (digits.startsWith('00243')) digits = digits.slice(2)
  if (digits.startsWith('243')) digits = digits.slice(3)
  else if (digits.startsWith('0')) digits = digits.slice(1)
  return /^[1-9]\d{8}$/.test(digits) ? `+243${digits}` : null
}
