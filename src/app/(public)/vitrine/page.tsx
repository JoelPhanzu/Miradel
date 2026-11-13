import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from '@phosphor-icons/react/ssr'
import { ButtonLink } from '@/components/public/ButtonLink'
import { SectionHeading } from '@/components/public/cards'
import { EntrepreneurCard } from '@/components/public/EntrepreneurCard'
import { PageHeader } from '@/components/public/PageHeader'
import { ProductSearch } from '@/components/public/ProductSearch'
import { IMAGES } from '@/content/images'
import {
  getPageSections,
  getProductCategories,
  getPublishedEntrepreneurs,
  getPublishedProducts,
  getSectors,
} from '@/lib/data/public'
import type { Entrepreneur } from '@/types/content'

export const metadata: Metadata = {
  title: 'Vitrine de l’entrepreneur',
  description:
    'Les produits de la Fondation MIRADEL FEVEPA et des entrepreneurs qu’elle accompagne en RDC, classés par secteur d’activité.',
}

const container = 'mx-auto max-w-7xl px-4 sm:px-6'

export default async function VitrinePage() {
  const [sections, entrepreneurs, sectors, products, categories] = await Promise.all([
    getPageSections(),
    getPublishedEntrepreneurs(),
    getSectors(),
    getPublishedProducts(),
    getProductCategories(),
  ])
  const intro = sections.shop_intro
  const people = sections.vitrine_entrepreneurs_intro
  const catalog = sections.vitrine_products_intro
  const count = (e: Entrepreneur) => products.filter((p) => p.entrepreneurId === e.id).length

  // Groupes : la fondation, puis un groupe par secteur, puis les vitrines sans secteur.
  const foundation = entrepreneurs.filter((e) => e.isFoundation)
  const others = entrepreneurs.filter((e) => !e.isFoundation)
  const groups = [
    ...(foundation.length
      ? [{ id: 'fondation', name: 'La fondation', description: null, items: foundation }]
      : []),
    ...sectors.map((s) => ({ ...s, id: s.slug, items: others.filter((e) => e.sectorId === s.id) })),
    {
      id: 'autres',
      name: 'Autres activités',
      description: null,
      items: others.filter((e) => !e.sectorId || !sectors.some((s) => s.id === e.sectorId)),
    },
  ].filter((g) => g.items.length > 0)
  const usedCategories = categories.filter((c) => products.some((p) => p.categoryId === c.id))

  return (
    <>
      <PageHeader
        title={intro?.title ?? 'Vitrine de l’entrepreneur'}
        intro={intro?.body}
        imageUrl={intro?.imageUrl}
        image={IMAGES.pages.vitrine}
      >
        <div>
          <ProductSearch categories={usedCategories} sectors={sectors} />
        </div>
      </PageHeader>

      <section className={`${container} py-14 md:py-20`}>
        <SectionHeading
          title={people?.title ?? 'Les entrepreneurs que nous accompagnons'}
          intro={people?.body}
        />
        {groups.length > 1 && (
          <nav
            aria-label="Secteurs d’activité"
            className="mt-8 flex flex-wrap justify-center gap-2"
          >
            {groups.map((g) => (
              <a
                key={g.id}
                href={`#secteur-${g.id}`}
                className="border-border text-navy-900 inline-flex min-h-11 items-center rounded-full border bg-white px-5 text-sm font-semibold transition-colors hover:border-orange-500 hover:text-orange-700"
              >
                {g.name}
                <span className="ml-2 rounded-full bg-green-50 px-2 text-xs font-bold text-green-700">
                  {g.items.length}
                </span>
              </a>
            ))}
          </nav>
        )}
        <div className="mt-10 grid gap-16">
          {groups.map((g) => (
            <section key={g.id} id={`secteur-${g.id}`} className="scroll-mt-28">
              <h3 className="font-display text-heading flex items-center gap-3 text-xl font-extrabold md:text-2xl">
                <span className="h-0.5 w-8 shrink-0 bg-orange-500" aria-hidden />
                {g.name}
              </h3>
              {g.description && <p className="text-ink-soft mt-2 max-w-[60ch]">{g.description}</p>}
              <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {g.items.map((e) => (
                  <li key={e.id} data-reveal>
                    <EntrepreneurCard
                      entrepreneur={e}
                      sectorName={g.id === 'autres' || g.id === 'fondation' ? null : g.name}
                      productCount={count(e)}
                    />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </section>

      <section className="bg-gray-50">
        <div className={`${container} py-14 md:py-20`}>
          <SectionHeading
            title={catalog?.title ?? 'Tous les produits'}
            intro={catalog?.body}
            href="/vitrine/produits"
            linkLabel={`Voir les ${products.length} produits`}
          />
          {usedCategories.length > 0 && (
            <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {usedCategories.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/vitrine/produits?categorie=${c.slug}`}
                    className="border-border text-navy-900 flex min-h-16 items-center justify-between gap-3 rounded-xl border bg-white px-5 font-bold shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    {c.name}
                    <span className="text-ink-soft inline-flex items-center gap-1 text-sm font-normal">
                      {products.filter((p) => p.categoryId === c.id).length}
                      <ArrowRight size={16} aria-hidden />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-10 flex justify-center">
            <ButtonLink href="/vitrine/produits">Parcourir le catalogue</ButtonLink>
          </div>
        </div>
      </section>
    </>
  )
}
