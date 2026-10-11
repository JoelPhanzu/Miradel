import { ArrowRight, Handshake, HandHeart, UsersThree } from '@phosphor-icons/react/ssr'
import Link from 'next/link'
import { ButtonLink } from '@/components/public/ButtonLink'
import {
  MetricsGrid,
  PartnerList,
  PostCard,
  ProgramCard,
  SectionHeading,
  TestimonialList,
} from '@/components/public/cards'
import { Emphasis } from '@/components/public/Emphasis'
import { DONATE_HREF } from '@/components/public/nav'
import { PhotoSlot } from '@/components/public/PhotoSlot'
import { ProductGrid } from '@/components/public/ProductGrid'
import {
  getImpactMetrics,
  getPageSections,
  getPartners,
  getPublishedPosts,
  getPublishedPrograms,
  getPublishedProducts,
  getSiteSettings,
  getTestimonials,
} from '@/lib/data/public'

const container = 'mx-auto max-w-[1320px] px-4 md:px-8'

export default async function HomePage() {
  const [sections, settings, programs, metrics, posts, testimonials, partners, products] =
    await Promise.all([
      getPageSections(),
      getSiteSettings(),
      getPublishedPrograms(),
      getImpactMetrics(),
      getPublishedPosts(),
      getTestimonials(),
      getPartners(),
      getPublishedProducts(),
    ])
  const hero = sections.home_hero
  const mission = sections.home_mission
  const programsSection = sections.home_programs
  const impact = sections.home_impact
  const shop = sections.home_shop
  const news = sections.home_news
  const cta = sections.home_cta
  const programTitle = new Map(programs.map((p) => [p.id, p.title]))
  const featured = products.filter((p) => p.isFeatured).slice(0, 4)
  const shownProducts = featured.length ? featured : products.slice(0, 4)

  return (
    <>
      {/* Bandeau principal */}
      <section className={`${container} grid gap-10 pt-10 pb-16 md:grid-cols-[1.1fr_0.9fr] md:items-center md:pt-16 md:pb-24`}>
        <div>
          <p className="rise text-ochre text-xs font-semibold tracking-[0.2em] uppercase">
            {settings.organizationName} · République démocratique du Congo
          </p>
          <h1
            className="rise font-display mt-5 text-5xl leading-[1.02] font-medium tracking-tight sm:text-6xl lg:text-7xl"
            style={{ '--i': 1 } as React.CSSProperties}
          >
            <Emphasis text={hero?.title ?? settings.organizationName} />
          </h1>
          {hero?.body && (
            <p
              className="rise text-ink-soft mt-6 max-w-[46ch] text-lg md:text-xl"
              style={{ '--i': 2 } as React.CSSProperties}
            >
              {hero.body}
            </p>
          )}
          <div className="rise mt-9 flex flex-wrap gap-3" style={{ '--i': 3 } as React.CSSProperties}>
            <ButtonLink href={hero?.buttonHref ?? DONATE_HREF}>
              <HandHeart size={18} aria-hidden />
              {hero?.buttonLabel ?? 'Faire un don'}
            </ButtonLink>
            <ButtonLink href="/nos-programmes" variant="outline">
              Nos programmes
            </ButtonLink>
          </div>
        </div>
        <PhotoSlot
          src={hero?.imageUrl}
          alt="Action de la fondation sur le terrain"
          brief="photo réelle d’une action de terrain (avec l’accord des personnes)"
          className="aspect-[4/5] md:aspect-[4/5]"
          sizes="(min-width: 768px) 45vw, 100vw"
          priority
        />
      </section>

      {/* Mission */}
      {mission && (
        <section className="bg-accent text-accent-ink">
          <div className={`${container} grid gap-8 py-16 md:grid-cols-[0.8fr_1.2fr] md:py-24`}>
            <h2 className="font-display text-4xl font-medium md:text-5xl" data-reveal>
              {mission.title}
            </h2>
            <div data-reveal>
              {mission.body && (
                <p className="font-display text-2xl leading-snug md:text-3xl">{mission.body}</p>
              )}
              {mission.buttonHref && (
                <Link
                  href={mission.buttonHref}
                  className="mt-8 inline-flex min-h-11 items-center gap-2 text-sm font-semibold underline underline-offset-4"
                >
                  {mission.buttonLabel ?? 'En savoir plus'}
                  <ArrowRight size={16} aria-hidden />
                </Link>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Programmes */}
      {programs.length > 0 && (
        <section className={`${container} py-16 md:py-24`}>
          <SectionHeading
            title={programsSection?.title ?? 'Nos programmes'}
            intro={programsSection?.body}
            href={programsSection?.buttonHref ?? '/nos-programmes'}
            linkLabel={programsSection?.buttonLabel ?? 'Tous les programmes'}
          />
          <ul className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {programs.slice(0, 4).map((program) => (
              <li key={program.id} data-reveal>
                <ProgramCard program={program} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Impact : n'apparaît qu'avec des chiffres publiés et justifiés */}
      {metrics.length > 0 && (
        <section className="bg-cream-deep">
          <div className={`${container} py-16 md:py-24`}>
            <SectionHeading
              title={impact?.title ?? 'Notre impact'}
              href={impact?.buttonHref ?? '/notre-impact'}
              linkLabel={impact?.buttonLabel ?? 'Voir notre impact'}
            />
            <div className="mt-10">
              <MetricsGrid metrics={metrics.slice(0, 4)} />
            </div>
          </div>
        </section>
      )}

      {/* Boutique solidaire */}
      {products.length > 0 && (
        <section className={`${container} py-16 md:py-24`}>
          <SectionHeading
            title={shop?.title ?? 'Boutique solidaire'}
            intro={shop?.body}
            href={shop?.buttonHref ?? '/boutique'}
            linkLabel={shop?.buttonLabel ?? 'Voir la boutique'}
          />
          <div className="mt-10">
            <ProductGrid products={shownProducts} />
          </div>
        </section>
      )}

      {/* Actualités */}
      {posts.length > 0 && (
        <section className="border-line border-t">
          <div className={`${container} py-16 md:py-24`}>
            <SectionHeading
              title={news?.title ?? 'Actualités'}
              href={news?.buttonHref ?? '/actualites'}
              linkLabel={news?.buttonLabel ?? 'Toutes les actualités'}
            />
            <ul className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {posts.slice(0, 3).map((post) => (
                <li key={post.id} data-reveal>
                  <PostCard
                    post={post}
                    programTitle={post.programId ? programTitle.get(post.programId) : null}
                  />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Témoignages (uniquement avec accord) */}
      {testimonials.length > 0 && (
        <section className={`${container} py-16 md:py-24`}>
          <SectionHeading title="Ils témoignent" />
          <div className="mt-10">
            <TestimonialList testimonials={testimonials.slice(0, 3)} />
          </div>
        </section>
      )}

      {/* Partenaires */}
      {partners.length > 0 && (
        <section className={`${container} pb-16 md:pb-24`}>
          <SectionHeading title={sections.foundation_partners?.title ?? 'Nos partenaires'} />
          <div className="mt-8">
            <PartnerList partners={partners} />
          </div>
        </section>
      )}

      {/* S'engager */}
      <section className="bg-ochre-soft">
        <div className={`${container} py-16 md:py-24`}>
          <SectionHeading title={cta?.title ?? 'S’engager à nos côtés'} intro={cta?.body} />
          <ul className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              {
                href: DONATE_HREF,
                title: 'Faire un don',
                text: 'Mobile money ou virement, avec une déclaration en ligne.',
                Icon: HandHeart,
              },
              {
                href: '/sengager#benevolat',
                title: 'Devenir bénévole',
                text: 'Proposer votre temps et vos compétences.',
                Icon: UsersThree,
              },
              {
                href: '/sengager#partenariat',
                title: 'Devenir partenaire',
                text: 'Construire une action commune avec la fondation.',
                Icon: Handshake,
              },
            ].map(({ href, title, text, Icon }) => (
              <li key={href} data-reveal>
                <Link
                  href={href}
                  className="bg-cream hover:border-ink border-line flex h-full flex-col border p-6 transition md:p-8"
                >
                  <Icon size={32} className="text-accent" aria-hidden />
                  <span className="font-display mt-6 text-3xl font-medium">{title}</span>
                  <span className="text-ink-soft mt-2">{text}</span>
                  <span className="text-accent mt-6 inline-flex items-center gap-2 text-sm font-semibold">
                    Continuer
                    <ArrowRight size={16} aria-hidden />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  )
}
