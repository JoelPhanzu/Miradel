import Image from 'next/image'
import type { ReactNode } from 'react'
import { HandHeart, WhatsappLogo } from '@phosphor-icons/react/ssr'
import { IMAGES } from '@/content/images'
import { getPageSections, getSiteSettings } from '@/lib/data/public'
import { buildWhatsAppUrl } from '@/lib/whatsapp'
import { ButtonLink } from './ButtonLink'
import { Emphasis } from './Emphasis'
import { IllustrationNote } from './PhotoSlot'
import { DONATE_HREF } from './nav'

/**
 * Bandeau d'appel à l'action avant le pied de page : photo (opacité 50 %) sous un dégradé
 * bleu marine, titre et texte de la section « Appel à s'engager » (admin), bouton de don et
 * bouton WhatsApp.
 */
export async function CtaBand({ children }: { children?: ReactNode }) {
  const [sections, settings] = await Promise.all([getPageSections(), getSiteSettings()])
  const cta = sections.home_cta
  const photo = cta?.imageUrl ? { src: cta.imageUrl, alt: '' } : IMAGES.ctaBand
  return (
    <section className="on-navy relative isolate overflow-hidden" aria-labelledby="cta-band-title">
      <Image src={photo.src} alt="" fill sizes="100vw" className="-z-20 object-cover opacity-50" />
      {!cta?.imageUrl && <IllustrationNote className="right-3 bottom-3" />}
      <div
        className="from-navy-900 via-navy-900/90 to-navy-900/60 absolute inset-0 -z-10 bg-gradient-to-r"
        aria-hidden
      />
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-20">
        <div className="max-w-3xl" data-reveal>
          <span className="flex items-center gap-1.5" aria-hidden>
            <span className="size-2.5 bg-orange-500" />
            <span className="h-0.5 w-10 bg-orange-500" />
          </span>
          <h2
            id="cta-band-title"
            className="font-display mt-4 text-2xl leading-tight font-extrabold text-white md:text-4xl"
          >
            <Emphasis text={cta?.title ?? 'S’engager à nos côtés'} onDark highlightLast />
          </h2>
          {cta?.body && <p className="mt-4 max-w-[60ch] text-white/95 md:text-lg">{cta.body}</p>}
        </div>
        {children}
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href={DONATE_HREF}>
            <HandHeart size={18} weight="fill" aria-hidden />
            Faire un don
          </ButtonLink>
          {settings.whatsappNumber && (
            <ButtonLink
              href={buildWhatsAppUrl(
                settings.whatsappNumber,
                `Bonjour ${settings.organizationName}, je souhaite un renseignement.`,
              )}
              target="_blank"
              rel="noopener noreferrer"
              variant="whatsapp"
            >
              <WhatsappLogo size={18} weight="fill" aria-hidden />
              Écrire sur WhatsApp
            </ButtonLink>
          )}
        </div>
      </div>
    </section>
  )
}
