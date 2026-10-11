import { WhatsappLogo } from '@phosphor-icons/react/ssr'
import { getSiteSettings } from '@/lib/data/public'
import { buildWhatsAppUrl } from '@/lib/whatsapp'

/** Bouton WhatsApp flottant, présent sur toutes les pages publiques. */
export async function WhatsAppFloat() {
  const settings = await getSiteSettings()
  return (
    <a
      href={buildWhatsAppUrl(
        settings.whatsappNumber,
        `Bonjour ${settings.organizationName}, je souhaite un renseignement.`,
      )}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Écrire à la fondation sur WhatsApp"
      className="bg-whatsapp fixed right-4 bottom-4 z-20 flex size-14 items-center justify-center rounded-full text-white shadow-[0_12px_30px_-10px_rgb(31_122_77/0.6)] transition duration-300 hover:-translate-y-0.5 active:scale-95 md:right-8 md:bottom-8 dark:text-[#10261a]"
    >
      <WhatsappLogo size={28} weight="fill" aria-hidden />
    </a>
  )
}
