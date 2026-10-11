import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, HandHeart } from '@phosphor-icons/react/ssr'
import { MessageForm } from '@/components/public/form/MessageForm'
import { DONATE_HREF } from '@/components/public/nav'
import { PageHeader } from '@/components/public/PageHeader'
import { RichText } from '@/components/public/ToComplete'
import { getPageSections } from '@/lib/data/public'

export const metadata: Metadata = {
  title: 'S’engager',
  description:
    'Faire un don, devenir bénévole ou partenaire de la Fondation MIRADEL FEVEPA pour les femmes et les jeunes vulnérables en RDC.',
}

const container = 'mx-auto max-w-[1320px] px-4 md:px-8'

export default async function EngagePage() {
  const sections = await getPageSections()
  const intro = sections.engage_intro
  const donate = sections.donate_intro
  const volunteer = sections.volunteer_intro
  const partnership = sections.partnership_intro

  return (
    <>
      <PageHeader title={intro?.title ?? 'S’engager'} intro={intro?.body} />

      <section className="bg-accent text-accent-ink">
        <div className={`${container} flex flex-wrap items-center justify-between gap-8 py-14`}>
          <div>
            <h2 className="font-display text-4xl font-medium md:text-5xl">
              {donate?.title ?? 'Faire un don'}
            </h2>
            <p className="mt-3 max-w-[52ch] opacity-90">
              Par mobile money ou virement, puis une déclaration en ligne pour que l’équipe
              confirme la réception.
            </p>
          </div>
          <Link
            href={DONATE_HREF}
            className="bg-cream text-ink inline-flex min-h-12 items-center gap-2 rounded-full px-6 text-sm font-semibold transition active:scale-[0.98]"
          >
            <HandHeart size={18} aria-hidden />
            Faire un don
            <ArrowRight size={16} aria-hidden />
          </Link>
        </div>
      </section>

      <section id="benevolat" className={`${container} grid scroll-mt-24 gap-10 py-16 md:grid-cols-[0.9fr_1.1fr] md:gap-20 md:py-24`}>
        <div data-reveal>
          <h2 className="font-display text-4xl font-medium md:text-5xl">
            {volunteer?.title ?? 'Devenir bénévole'}
          </h2>
          <div className="mt-6">
            <RichText text={volunteer?.body} />
          </div>
        </div>
        <MessageForm kind="benevolat" />
      </section>

      <section id="partenariat" className="bg-cream-deep scroll-mt-24">
        <div className={`${container} grid gap-10 py-16 md:grid-cols-[0.9fr_1.1fr] md:gap-20 md:py-24`}>
          <div data-reveal>
            <h2 className="font-display text-4xl font-medium md:text-5xl">
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
