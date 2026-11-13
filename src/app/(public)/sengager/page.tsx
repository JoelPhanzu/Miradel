import type { Metadata } from 'next'
import { Kicker } from '@/components/public/cards'
import { HandHeart } from '@phosphor-icons/react/ssr'
import { MessageForm } from '@/components/public/form/MessageForm'
import { DONATE_HREF } from '@/components/public/nav'
import { PageHeader } from '@/components/public/PageHeader'
import { RichText } from '@/components/public/ToComplete'
import { ButtonLink } from '@/components/public/ButtonLink'
import { IMAGES } from '@/content/images'
import { getPageSections } from '@/lib/data/public'

export const metadata: Metadata = {
  title: 'S’engager',
  description:
    'Faire un don, devenir bénévole ou partenaire de la Fondation MIRADEL FEVEPA pour les femmes et les jeunes vulnérables en RDC.',
}

const container = 'mx-auto max-w-7xl px-4 sm:px-6'

export default async function EngagePage() {
  const sections = await getPageSections()
  const intro = sections.engage_intro
  const donate = sections.donate_intro
  const volunteer = sections.volunteer_intro
  const partnership = sections.partnership_intro

  return (
    <>
      <PageHeader
        title={intro?.title ?? 'S’engager'}
        intro={intro?.body}
        imageUrl={intro?.imageUrl}
        image={IMAGES.pages.sengager}
      />

      <section className="on-navy on-navy-800">
        <div className={`${container} flex flex-wrap items-center justify-between gap-8 py-14`}>
          <div>
            <Kicker className="mb-3" />
            <h2 className="font-display text-heading text-2xl font-extrabold md:text-4xl">
              {donate?.title ?? 'Faire un don'}
            </h2>
            <p className="mt-3 max-w-[52ch] text-white/90">
              Par mobile money ou virement, puis une déclaration en ligne pour que l’équipe confirme
              la réception.
            </p>
          </div>
          <ButtonLink href={DONATE_HREF}>
            <HandHeart size={18} weight="fill" aria-hidden />
            Faire un don
          </ButtonLink>
        </div>
      </section>

      <section
        id="benevolat"
        className={`${container} grid scroll-mt-24 gap-10 py-14 md:grid-cols-[0.9fr_1.1fr] md:gap-16 md:py-20`}
      >
        <div data-reveal>
          <Kicker className="mb-3" />
          <h2 className="font-display text-heading text-2xl font-extrabold md:text-4xl">
            {volunteer?.title ?? 'Devenir bénévole'}
          </h2>
          <div className="mt-6">
            <RichText text={volunteer?.body} />
          </div>
        </div>
        <MessageForm kind="benevolat" />
      </section>

      <section id="partenariat" className="scroll-mt-24 bg-gray-50">
        <div
          className={`${container} grid gap-10 py-14 md:grid-cols-[0.9fr_1.1fr] md:gap-16 md:py-20`}
        >
          <div data-reveal>
            <Kicker className="mb-3" />
            <h2 className="font-display text-heading text-2xl font-extrabold md:text-4xl">
              {partnership?.title ?? 'Devenir partenaire'}
            </h2>
            <div className="mt-6">
              <RichText text={partnership?.body} />
            </div>
          </div>
          <MessageForm kind="partenariat" />
        </div>
      </section>
    </>
  )
}
