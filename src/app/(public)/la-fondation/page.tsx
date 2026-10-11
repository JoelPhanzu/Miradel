import type { Metadata } from 'next'
import Image from 'next/image'
import { PartnerList, SectionHeading } from '@/components/public/cards'
import { IdentityCard } from '@/components/public/IdentityCard'
import { PageHeader } from '@/components/public/PageHeader'
import { PhotoSlot } from '@/components/public/PhotoSlot'
import { RichText, ToCompleteMark } from '@/components/public/ToComplete'
import { getPageSections, getPartners, getSiteSettings, getTeamMembers } from '@/lib/data/public'

export const metadata: Metadata = {
  title: 'La Fondation',
  description:
    'Mission, histoire, gouvernance et équipe de la Fondation MIRADEL FEVEPA, qui agit pour les femmes et les jeunes vulnérables en RDC.',
}

const container = 'mx-auto max-w-[1320px] px-4 md:px-8'

export default async function FoundationPage() {
  const [sections, settings, team, partners] = await Promise.all([
    getPageSections(),
    getSiteSettings(),
    getTeamMembers(),
    getPartners(),
  ])
  const intro = sections.foundation_intro
  const history = sections.foundation_history
  const governance = sections.foundation_governance

  return (
    <>
      <PageHeader title={intro?.title ?? 'La Fondation'} intro={intro?.body} />

      <section className={`${container} grid gap-12 pb-16 md:grid-cols-[1fr_1fr] md:gap-20 md:pb-24`}>
        <div data-reveal>
          <h2 className="font-display text-4xl font-medium">{history?.title ?? 'Notre histoire'}</h2>
          <div className="mt-6">
            <RichText text={history?.body} />
          </div>
        </div>
        <PhotoSlot
          src={history?.imageUrl ?? intro?.imageUrl}
          alt="La fondation sur le terrain"
          brief="photo réelle de l’équipe ou d’une action de la fondation"
          className="aspect-[4/3]"
          sizes="(min-width: 768px) 50vw, 100vw"
        />
      </section>

      <section className="bg-cream-deep">
        <div className={`${container} grid gap-12 py-16 md:grid-cols-2 md:gap-20 md:py-24`}>
          <div data-reveal>
            <h2 className="font-display text-4xl font-medium">
              {governance?.title ?? 'Gouvernance'}
            </h2>
            <div className="mt-6">
              <RichText text={governance?.body} />
            </div>
          </div>
          <div data-reveal>
            <h2 className="font-display text-4xl font-medium">Identité</h2>
            <div className="mt-6">
              <IdentityCard settings={settings} />
            </div>
          </div>
        </div>
      </section>

      <section className={`${container} py-16 md:py-24`}>
        <SectionHeading title={sections.foundation_team?.title ?? 'L’équipe'} />
        {team.length === 0 ? (
          <p className="mt-6">
            Responsables et équipe : <ToCompleteMark />
          </p>
        ) : (
          <ul className="mt-10 grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4">
            {team.map((member) => (
              <li key={member.id} data-reveal>
                <div className="bg-cream-deep relative aspect-square overflow-hidden">
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
                <h3 className="font-display mt-4 text-2xl font-semibold">{member.fullName}</h3>
                <p className="text-ochre text-sm font-semibold">{member.role}</p>
                {member.bio && <p className="text-ink-soft mt-2 text-sm">{member.bio}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>

      {partners.length > 0 && (
        <section className={`${container} pb-16 md:pb-24`}>
          <SectionHeading title={sections.foundation_partners?.title ?? 'Nos partenaires'} />
          <div className="mt-8">
            <PartnerList partners={partners} />
          </div>
        </section>
      )}
    </>
  )
}
