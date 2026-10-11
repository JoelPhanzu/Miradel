import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { Catalog } from '@/components/public/Catalog'
import { PageHeader } from '@/components/public/PageHeader'
import { getProductCategories, getPublishedProducts } from '@/lib/data/public'
import { slugParams } from '@/lib/static-params'

export async function generateStaticParams() {
  return slugParams((await getProductCategories()).map((c) => c.slug))
}

export async function generateMetadata({
  params,
}: PageProps<'/boutique/c/[slug]'>): Promise<Metadata> {
  const { slug } = await params
  const category = (await getProductCategories()).find((c) => c.slug === slug)
  if (!category) return {}
  return {
    title: `${category.name} | Boutique solidaire`,
    description: category.description ?? undefined,
  }
}

async function CategoryPageContent({ params }: Pick<PageProps<'/boutique/c/[slug]'>, 'params'>) {
  const { slug } = await params
  const [categories, products] = await Promise.all([
    getProductCategories(),
    getPublishedProducts(),
  ])
  const category = categories.find((c) => c.slug === slug)
  if (!category) notFound()

  return (
    <>
      <PageHeader title={category.name} intro="Boutique solidaire" />
      <div className="mx-auto max-w-[1320px] px-4 pb-24 md:px-8">
        <Catalog products={products} categories={categories} activeSlug={slug} />
      </div>
    </>
  )
}

export default function CategoryPage({ params }: PageProps<'/boutique/c/[slug]'>) {
  return (
    <Suspense fallback={<div className="mx-auto h-[70vh] max-w-[1320px]" />}>
      <CategoryPageContent params={params} />
    </Suspense>
  )
}
