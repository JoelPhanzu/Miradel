import { WhatsappLogo } from '@phosphor-icons/react/ssr'
import { getSiteSettings } from '@/lib/data/public'
import { buildWhatsAppUrl } from '@/lib/whatsapp'

/**
 * Bouton WhatsApp flottant, présent sur toutes les pages publiques.
 * Halo animé (coupé si l'utilisateur réduit les animations), infobulle au survol sur ordinateur,
 * zone de sécurité des iPhone respectée. Le pied de page garde une marge basse pour qu'il ne
 * cache aucun lien.
 */
export async function WhatsAppFloat() {
  const settings = await getSiteSettings()
  if (!settings.whatsappNumber) return null
  return (
    <a
      href={buildWhatsAppUrl(
        settings.whatsappNumber,
        `Bonjour ${settings.organizationName}, je souhaite un renseignement.`,
      )}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Écrire à la fondation sur WhatsApp"
      className="group bg-whatsapp fixed right-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-30 flex size-14 items-center justify-center rounded-full text-white shadow-lg transition duration-300 hover:-translate-y-0.5 active:scale-95 md:right-6 md:bottom-[calc(1.5rem+env(safe-area-inset-bottom))] md:size-16"
    >
      <span
        className="bg-whatsapp absolute inset-0 animate-ping rounded-full opacity-40 motion-reduce:hidden"
        aria-hidden
      />
      <WhatsappLogo size={30} weight="fill" className="relative" aria-hidden />
      <span
        className="bg-navy-950 pointer-events-none absolute right-full mr-3 hidden rounded-lg px-3 py-2 text-sm font-semibold whitespace-nowrap text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 md:block"
        aria-hidden
      >
        Écrire sur WhatsApp
      </span>
    </a>
  )
}
