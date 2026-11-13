import type { Metadata } from 'next'
import Image from 'next/image'
import { PartnerList, SectionHeading, Kicker } from '@/components/public/cards'
import { IdentityCard } from '@/components/public/IdentityCard'
import { PageHeader } from '@/components/public/PageHeader'
import { PhotoSlot } from '@/components/public/PhotoSlot'
import { RichText, ToCompleteMark } from '@/components/public/ToComplete'
import { ValuesSection } from '@/components/public/ValuesSection'
import { IMAGES } from '@/content/images'
import {
  getOrganizationValues,
  getPageSections,
  getPartners,
  getSiteSettings,
  getTeamMembers,
} from '@/lib/data/public'

export const metadata: Metadata = {
  title: 'La Fondation',
  description:
    'Mission, histoire, gouvernance et équipe de la Fondation MIRADEL FEVEPA, qui agit pour les femmes et les jeunes vulnérables en RDC.',
}

const container = 'mx-auto max-w-7xl px-4 sm:px-6'

export default async function FoundationPage() {
  const [sections, settings, team, partners, values] = await Promise.all([
    getPageSections(),
    getSiteSettings(),
    getTeamMembers(),
    getPartners(),
    getOrganizationValues(),
  ])
  const intro = sections.foundation_intro
  const history = sections.foundation_history
  const mission = sections.home_mission
  const vision = sections.foundation_vision
  const governance = sections.foundation_governance

  return (
    <>
      <PageHeader
        title={intro?.title ?? 'La Fondation'}
        intro={intro?.body}
        imageUrl={intro?.imageUrl}
        image={IMAGES.pages.fondation}
      />

      {/* Mission et vision côte à côte */}
      <section className={`${container} grid gap-6 pt-14 md:grid-cols-2 md:pt-20`}>
        {[
          { id: 'mission', title: mission?.title ?? 'Notre mission', text: mission?.body },
          { id: 'vision', title: vision?.title ?? 'Notre vision', text: vision?.body },
        ].map((block) => (
          <div
            key={block.id}
            data-reveal
            className="border-border min-w-0 rounded-xl border border-t-4 border-t-orange-500 bg-gray-50 p-6 md:p-8"
          >
            <h2 className="font-display text-heading text-2xl font-extrabold md:text-3xl">
              {block.title}
            </h2>
            <div className="text-ink-700 mt-4 text-lg leading-relaxed">
              <RichText text={block.text} />
            </div>
          </div>
        ))}
      </section>

      <section
        className={`${container} grid items-center gap-10 py-14 md:py-20 lg:grid-cols-2 lg:gap-16`}
      >
        <div data-reveal>
          <Kicker className="mb-3" />
          <h2 className="font-display text-heading text-2xl font-extrabold md:text-4xl">
            {history?.title ?? 'Notre histoire'}
          </h2>
          <div className="mt-6">
            <RichText text={history?.body} />
          </div>
        </div>
        <PhotoSlot
          src={history?.imageUrl ?? intro?.imageUrl}
          alt="La fondation sur le terrain"
          brief="photo réelle de l’équipe ou d’une action de la fondation"
          fallback={IMAGES.mission}
          className="aspect-[4/3] rounded-xl shadow-lg"
          sizes="(min-width: 768px) 50vw, 100vw"
        />
      </section>

      <ValuesSection
        title={sections.home_values?.title ?? 'Nos valeurs et principes d’action'}
        intro={sections.home_values?.body}
        values={values}
      />

      <section className="bg-gray-50">
        <div className={`${container} grid gap-12 py-14 md:grid-cols-2 md:gap-16 md:py-20`}>
          <div data-reveal>
            <Kicker className="mb-3" />
            <h2 className="font-display text-heading text-2xl font-extrabold md:text-4xl">
              {governance?.title ?? 'Gouvernance'}
            </h2>
            <div className="mt-6">
              <RichText text={governance?.body} />
            </div>
          </div>
          <div data-reveal>
            <Kicker className="mb-3" />
            <h2 className="font-display text-heading text-2xl font-extrabold md:text-4xl">
              Identité
            </h2>
            <div className="mt-6">
              <IdentityCard settings={settings} />
            </div>
          </div>
        </div>
      </section>

      <section className={`${container} py-14 md:py-20`}>
        <SectionHeading title={sections.foundation_team?.title ?? 'L’équipe'} />
        {team.length === 0 ? (
          <p className="mt-6">
            Responsables et équipe : <ToCompleteMark />
          </p>
        ) : (
          <ul className="mt-10 grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4">
            {team.map((member) => (
              <li key={member.id} data-reveal>
                <div className="bg-navy-100 relative aspect-square overflow-hidden rounded-xl">
                  {member.photoUrl && (
                    <Image
                      src={member.photoUrl}
                      alt={member.fullName}
                      fill
                      sizes="(min-width: 1024px) 25vw, 50vw"
                      className="object-cover"
                    />
                  )}
                </div>
                <h3 className="font-display text-heading mt-4 text-lg font-extrabold break-words md:text-xl">
                  {member.fullName}
                </h3>
                <p className="text-sm font-semibold text-orange-700">{member.role}</p>
                {member.bio && <p className="text-ink-soft mt-2 text-sm">{member.bio}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>

      {partners.length > 0 && (
        <section className={`${container} pb-14 md:pb-20`}>
          <SectionHeading title={sections.foundation_partners?.title ?? 'Nos partenaires'} />
          <div className="mt-8">
            <PartnerList partners={partners} />
          </div>
        </section>
      )}
    </>
  )
}
