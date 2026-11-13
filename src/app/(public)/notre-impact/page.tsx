import type { Metadata } from 'next'
import { ButtonLink } from '@/components/public/ButtonLink'
import { MetricsGrid, SectionHeading, TestimonialList } from '@/components/public/cards'
import { PageHeader } from '@/components/public/PageHeader'
import { ToCompleteMark } from '@/components/public/ToComplete'
import { IMAGES } from '@/content/images'
import { getImpactMetrics, getPageSections, getTestimonials } from '@/lib/data/public'

export const metadata: Metadata = {
  title: 'Notre impact',
  description:
    'Les résultats de la Fondation MIRADEL FEVEPA : chiffres clés justifiés et témoignages de bénéficiaires.',
}

const container = 'mx-auto max-w-7xl px-4 sm:px-6'

export default async function ImpactPage() {
  const [{ impact_intro: intro }, metrics, testimonials] = await Promise.all([
    getPageSections(),
    getImpactMetrics(),
    getTestimonials(),
  ])

  return (
    <>
      <PageHeader
        title={intro?.title ?? 'Notre impact'}
        intro={intro?.body}
        imageUrl={intro?.imageUrl}
        image={IMAGES.pages.impact}
      />

      <section className={`${container} py-14 md:py-20`}>
        {metrics.length > 0 ? (
          <MetricsGrid metrics={metrics} />
        ) : (
          <p>
            Chiffres clés : <ToCompleteMark />
          </p>
        )}
      </section>

      {testimonials.length > 0 && (
        <section className="bg-gray-50">
          <div className={`${container} py-14 md:py-20`}>
            <SectionHeading title="Ils témoignent" />
            <div className="mt-10">
              <TestimonialList testimonials={testimonials} />
            </div>
          </div>
        </section>
      )}

      <section
        className={`${container} flex flex-wrap items-center justify-between gap-6 py-14 md:py-20`}
      >
        <p className="font-display text-heading max-w-[30ch] text-2xl font-extrabold md:text-3xl">
          Les actions de terrain, datées et illustrées.
        </p>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/actualites" variant="secondary">
            Voir les actualités
          </ButtonLink>
          <ButtonLink href="/transparence" variant="outline">
            Rapports et documents
          </ButtonLink>
        </div>
      </section>
    </>
  )
}
