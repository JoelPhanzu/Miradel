/**
 * Lien wa.me avec message pré-rempli.
 * Le numéro vient toujours de `settings.whatsapp_number`, jamais codé en dur.
 */
export function buildWhatsAppUrl(whatsappNumber: string, message?: string): string {
  const number = whatsappNumber.replace(/\D/g, '')
  const base = `https://wa.me/${number}`
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}
