import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { PageHeader } from '@/components/public/PageHeader'
import { ProductGrid } from '@/components/public/ProductGrid'
import { ProductSearch } from '@/components/public/ProductSearch'
import {
  getPageSections,
  getProductCategories,
  getPublishedEntrepreneurs,
  getPublishedProducts,
  getSectors,
} from '@/lib/data/public'
import { filterProducts } from '@/lib/vitrine'

export const metadata: Metadata = {
  title: 'Tous les produits | Vitrine de l’entrepreneur',
  description:
    'Rechercher un produit de la Fondation MIRADEL FEVEPA ou des entrepreneurs qu’elle accompagne, par catégorie ou secteur d’activité.',
}

const first = (value: string | string[] | undefined) =>
  (Array.isArray(value) ? value[0] : value)?.slice(0, 100) ?? ''

/** Résultats : dépendent de la recherche (lue à la requête). */
async function Results({ searchParams }: Pick<PageProps<'/vitrine/produits'>, 'searchParams'>) {
  const params = await searchParams
  const filters = {
    q: first(params.q),
    categorie: first(params.categorie),
    secteur: first(params.secteur),
  }
  const [products, categories, sectors, entrepreneurs] = await Promise.all([
    getPublishedProducts(),
    getProductCategories(),
    getSectors(),
    getPublishedEntrepreneurs(),
  ])
  const usedCategories = categories.filter((c) => products.some((p) => p.categoryId === c.id))
  const shown = filterProducts(products, filters, { entrepreneurs, categories, sectors })
  const filtered = Boolean(filters.q || filters.categorie || filters.secteur)

  const pill = (selected: boolean) =>
    `inline-flex min-h-11 shrink-0 items-center rounded-full border px-5 text-sm font-semibold transition ${
      selected ? 'bg-ink text-cream border-ink' : 'border-line hover:border-ink'
    }`

  return (
    <>
      <ProductSearch categories={usedCategories} sectors={sectors} defaults={filters} />
      {usedCategories.length > 1 && (
        <nav
          aria-label="Catégories"
          className="-mx-4 mt-6 flex gap-2 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0"
        >
          <Link href="/vitrine/produits" className={pill(!filters.categorie)}>
            Tout
          </Link>
          {usedCategories.map((c) => (
            <Link
              key={c.id}
              href={`/vitrine/produits?categorie=${c.slug}`}
              className={pill(filters.categorie === c.slug)}
              aria-current={filters.categorie === c.slug ? 'page' : undefined}
            >
              {c.name}
            </Link>
          ))}
        </nav>
      )}
      <p className="text-ink-soft mt-8 text-sm" role="status">
        {shown.length} produit{shown.length > 1 ? 's' : ''}
        {filtered ? ' correspondant à votre recherche' : ''}
        {filtered && (
          <>
            {' · '}
            <Link href="/vitrine/produits" className="underline underline-offset-4">
              Effacer la recherche
            </Link>
          </>
        )}
      </p>
      <div className="mt-8">
        {shown.length === 0 ? (
          <p className="text-ink-soft">
            Aucun produit ne correspond. Essayez un autre mot ou une autre catégorie.
          </p>
        ) : (
          <ProductGrid products={shown} />
        )}
      </div>
    </>
  )
}

export default async function ProductsPage({ searchParams }: PageProps<'/vitrine/produits'>) {
  const { vitrine_products_intro: intro } = await getPageSections()
  return (
    <>
      <PageHeader title={intro?.title ?? 'Tous les produits'} intro={intro?.body}>
        <Link
          href="/vitrine"
          className="text-accent mt-4 inline-flex min-h-11 items-center text-sm font-semibold underline underline-offset-4"
        >
          Voir les entrepreneurs par secteur
        </Link>
      </PageHeader>
      <div className="mx-auto max-w-[1320px] px-4 pb-24 md:px-8">
        <Suspense fallback={<div className="bg-cream-deep h-96 animate-pulse rounded-3xl" />}>
          <Results searchParams={searchParams} />
        </Suspense>
      </div>
    </>
  )
}
