import { HandHeart, Handshake, UsersThree } from '@phosphor-icons/react/ssr'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { ButtonLink } from '@/components/public/ButtonLink'
import {
  Kicker,
  MetricsGrid,
  PartnerList,
  PostCard,
  ProgramCard,
  SectionHeading,
  TestimonialList,
} from '@/components/public/cards'
import { CtaBand } from '@/components/public/CtaBand'
import { Emphasis } from '@/components/public/Emphasis'
import { EntrepreneurCard } from '@/components/public/EntrepreneurCard'
import { HeroSlideshow } from '@/components/public/HeroSlideshow'
import { DONATE_HREF } from '@/components/public/nav'
import { IllustrationNote, PhotoSlot } from '@/components/public/PhotoSlot'
import { ProductGrid } from '@/components/public/ProductGrid'
import { ValuesSection } from '@/components/public/ValuesSection'
import { IMAGES } from '@/content/images'
import {
  getImpactMetrics,
  getOrganizationValues,
  getPageSections,
  getPartners,
  getPublishedEntrepreneurs,
  getPublishedPosts,
  getPublishedPrograms,
  getPublishedProducts,
  getSectors,
  getSiteSettings,
  getTestimonials,
} from '@/lib/data/public'

const container = 'mx-auto max-w-7xl px-4 sm:px-6'
const sectionY = 'py-14 md:py-20'

/** Fonds alternés blanc / gris très clair, quelles que soient les sections publiées. */
function Alternating({ sections }: { sections: { key: string; node: ReactNode }[] }) {
  return sections.map(({ key, node }, i) => (
    <section key={key} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
      <div className={`${container} ${sectionY}`}>{node}</div>
    </section>
  ))
}

export default async function HomePage() {
  const [
    sections,
    settings,
    programs,
    metrics,
    posts,
    testimonials,
    partners,
    products,
    values,
    entrepreneurs,
    sectors,
  ] = await Promise.all([
    getPageSections(),
    getSiteSettings(),
    getPublishedPrograms(),
    getImpactMetrics(),
    getPublishedPosts(),
    getTestimonials(),
    getPartners(),
    getPublishedProducts(),
    getOrganizationValues(),
    getPublishedEntrepreneurs(),
    getSectors(),
  ])
  const hero = sections.home_hero
  const mission = sections.home_mission
  const programsSection = sections.home_programs
  const impact = sections.home_impact
  const shop = sections.home_shop
  const news = sections.home_news
  const programTitle = new Map(programs.map((p) => [p.id, p.title]))
  const sectorName = new Map(sectors.map((x) => [x.id, x.name]))
  const realHeroImages = [hero?.imageUrl, ...(hero?.gallery ?? [])].filter((src): src is string =>
    Boolean(src),
  )
  const featuredEntrepreneurs = (
    entrepreneurs.some((e) => e.isFeatured)
      ? entrepreneurs.filter((e) => e.isFeatured)
      : entrepreneurs
  ).slice(0, 3)
  const featured = products.filter((p) => p.isFeatured).slice(0, 4)
  const shownProducts = featured.length ? featured : products.slice(0, 4)
  const shownPrograms = programs.slice(0, 4)

  // Sections sur fonds alternés (seules celles qui ont du contenu publié apparaissent).
  const alternating: { key: string; node: ReactNode }[] = []
  if (shownPrograms.length > 0) {
    alternating.push({
      key: 'programmes',
      node: (
        <>
          <SectionHeading
            title={programsSection?.title ?? 'Nos programmes'}
            intro={programsSection?.body}
            href={programsSection?.buttonHref ?? '/nos-programmes'}
            linkLabel={programsSection?.buttonLabel ?? 'Tous les programmes'}
          />
          <ul
            className={`mt-14 grid gap-x-6 gap-y-12 sm:grid-cols-2 ${shownPrograms.length === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}
          >
            {shownPrograms.map((program) => (
              <li key={program.id} data-reveal>
                <ProgramCard program={program} />
              </li>
            ))}
          </ul>
        </>
      ),
    })
  }
  if (metrics.length > 0) {
    alternating.push({
      key: 'impact',
      node: (
        <>
          <SectionHeading
            title={impact?.title ?? 'Notre impact'}
            intro={impact?.body}
            href={impact?.buttonHref ?? '/notre-impact'}
            linkLabel={impact?.buttonLabel ?? 'Voir notre impact'}
          />
          <div className="mt-10">
            <MetricsGrid metrics={metrics.slice(0, 4)} />
          </div>
        </>
      ),
    })
  }
  if (featuredEntrepreneurs.length > 0) {
    alternating.push({
      key: 'vitrine',
      node: (
        <>
          <SectionHeading
            title={shop?.title ?? 'Vitrine de l’entrepreneur'}
            intro={shop?.body}
            href={shop?.buttonHref ?? '/vitrine'}
            linkLabel={shop?.buttonLabel ?? 'Voir la Vitrine de l’entrepreneur'}
          />
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredEntrepreneurs.map((e) => (
              <li key={e.id} data-reveal>
                <EntrepreneurCard
                  entrepreneur={e}
                  sectorName={e.sectorId ? sectorName.get(e.sectorId) : null}
                  productCount={products.filter((p) => p.entrepreneurId === e.id).length}
                />
              </li>
            ))}
          </ul>
          {shownProducts.length > 0 && (
            <div className="mt-14">
              <h3 className="font-display text-heading text-center text-xl font-extrabold md:text-2xl">
                À découvrir
              </h3>
              <div className="mt-6">
                <ProductGrid products={shownProducts} />
              </div>
            </div>
          )}
        </>
      ),
    })
  }
  if (posts.length > 0) {
    alternating.push({
      key: 'actualites',
      node: (
        <>
          <SectionHeading
            title={news?.title ?? 'Actualités'}
            intro={news?.body}
            href={news?.buttonHref ?? '/actualites'}
            linkLabel={news?.buttonLabel ?? 'Toutes les actualités'}
          />
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.slice(0, 3).map((post) => (
              <li key={post.id} data-reveal>
                <PostCard
                  post={post}
                  programTitle={post.programId ? programTitle.get(post.programId) : null}
                />
              </li>
            ))}
          </ul>
        </>
      ),
    })
  }
  if (testimonials.length > 0) {
    alternating.push({
      key: 'temoignages',
      node: (
        <>
          <SectionHeading title="Ils témoignent" />
          <div className="mt-10">
            <TestimonialList testimonials={testimonials.slice(0, 3)} />
          </div>
        </>
      ),
    })
  }
  if (partners.length > 0) {
    alternating.push({
      key: 'partenaires',
      node: (
        <>
          <SectionHeading title={sections.foundation_partners?.title ?? 'Nos partenaires'} />
          <div className="mt-10">
            <PartnerList partners={partners} />
          </div>
        </>
      ),
    })
  }

  const engage = [
    {
      href: DONATE_HREF,
      title: 'Faire un don',
      text: 'Mobile money ou virement, avec une déclaration en ligne.',
      Icon: HandHeart,
      tone: 'text-orange-400',
    },
    {
      href: '/sengager#benevolat',
      title: 'Devenir bénévole',
      text: 'Proposer votre temps et vos compétences.',
      Icon: UsersThree,
      tone: 'text-green-400',
    },
    {
      href: '/sengager#partenariat',
      title: 'Devenir partenaire',
      text: 'Construire une action commune avec la fondation.',
      Icon: Handshake,
      tone: 'text-orange-400',
    },
  ]

  return (
    <>
      {/* Bandeau principal : photo plein écran, dégradé bleu marine de gauche à droite */}
      <section className="on-navy relative isolate flex min-h-[calc(100svh-6.5rem)] items-center overflow-hidden md:min-h-[min(80svh,46rem)]">
        {realHeroImages.length > 0 ? (
          <HeroSlideshow images={realHeroImages} />
        ) : (
          <>
            <HeroSlideshow images={[IMAGES.hero.src]} position={IMAGES.hero.position} />
            <IllustrationNote className="right-3 bottom-3" />
          </>
        )}
        <div
          className="from-navy-900 via-navy-900/85 to-navy-900/10 absolute inset-0 -z-10 bg-gradient-to-r"
          aria-hidden
        />
        <div className={`${container} w-full py-14 md:py-20`}>
          <div className="max-w-2xl">
            <p className="rise text-xs font-bold tracking-[0.18em] text-orange-400 uppercase">
              {settings.organizationName} · République démocratique du Congo
            </p>
            <h1
              className="rise font-display mt-5 text-4xl leading-[1.08] font-extrabold text-white sm:text-5xl lg:text-6xl"
              style={{ '--i': 1 } as React.CSSProperties}
            >
              <Emphasis text={hero?.title ?? settings.organizationName} onDark highlightLast />
            </h1>
            <span className="rise mt-6 block h-1 w-24 rounded-full bg-orange-500" aria-hidden />
            {hero?.body && (
              <p
                className="rise mt-6 max-w-[46ch] text-lg text-white/95 md:text-xl"
                style={{ '--i': 2 } as React.CSSProperties}
              >
                {hero.body}
              </p>
            )}
            <div
              className="rise mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap"
              style={{ '--i': 3 } as React.CSSProperties}
            >
              <ButtonLink href={hero?.buttonHref ?? DONATE_HREF} className="w-full sm:w-auto">
                <HandHeart size={18} weight="fill" aria-hidden />
                {hero?.buttonLabel ?? 'Faire un don'}
              </ButtonLink>
              <ButtonLink href="/nos-programmes" variant="onDark" className="w-full sm:w-auto">
                Nos programmes
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      {/* Mission : photo pleine hauteur à gauche, texte à droite */}
      {mission && (
        <section className="bg-white">
          <div className="grid lg:grid-cols-2">
            <PhotoSlot
              src={mission.imageUrl}
              alt={mission.title ?? 'Notre mission'}
              brief="photo réelle de la fondation sur le terrain"
              fallback={IMAGES.mission}
              className="min-h-72 sm:min-h-96 lg:min-h-full"
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
            <div className="px-4 py-14 sm:px-6 md:py-20 lg:px-12 xl:px-16" data-reveal>
              <div className="max-w-xl">
                <Kicker />
                <h2 className="font-display text-heading mt-4 text-2xl leading-tight font-extrabold md:text-4xl">
                  <Emphasis text={mission.title ?? 'Notre mission'} highlightLast />
                </h2>
                {mission.body && (
                  <p className="text-ink-700 mt-6 text-lg leading-relaxed md:text-xl">
                    {mission.body}
                  </p>
                )}
                {mission.buttonHref && (
                  <ButtonLink href={mission.buttonHref} variant="secondary" className="mt-8">
                    {mission.buttonLabel ?? 'En savoir plus'}
                  </ButtonLink>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Valeurs et principes d'action : bandeau bleu marine « atouts » */}
      <ValuesSection
        title={sections.home_values?.title ?? 'Nos valeurs et principes d’action'}
        intro={sections.home_values?.body}
        values={values}
      />

      <Alternating sections={alternating} />

      {/* S'engager : bandeau photo, trois piliers séparés par des lignes fines */}
      <CtaBand>
        <ul className="mt-10 grid gap-8 sm:grid-cols-3 sm:gap-0">
          {engage.map(({ href, title, text, Icon, tone }) => (
            <li
              key={href}
              data-reveal
              className="min-w-0 sm:border-l sm:border-white/15 sm:px-6 sm:first:border-l-0 sm:first:pl-0"
            >
              <Link href={href} className="group block">
                <Icon size={40} weight="duotone" className={tone} aria-hidden />
                <span className="font-display mt-4 block text-xl font-extrabold text-white group-hover:text-orange-400">
                  {title}
                </span>
                <span className="mt-1.5 block text-white/80">{text}</span>
              </Link>
            </li>
          ))}
        </ul>
      </CtaBand>
    </>
  )
}
