// Sans 0/O, 1/I/L : lisible au téléphone et dans WhatsApp.
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

/** Référence courte : « C-9XMP2 » (commande) ou « D-7K3QF » (don). */
export function generateReference(prefix: 'C' | 'D'): string {
  const bytes = crypto.getRandomValues(new Uint8Array(5))
  const code = Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join('')
  return `${prefix}-${code}`
}
