import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { HandHeart } from '@phosphor-icons/react/ssr'
import { ButtonLink } from '@/components/public/ButtonLink'
import {
  MetricsGrid,
  PhotoGallery,
  PostCard,
  SectionHeading,
  StatusBadge,
} from '@/components/public/cards'
import { PageHeader } from '@/components/public/PageHeader'
import { programImage } from '@/content/images'
import { TO_COMPLETE } from '@/db/seed-data'
import { DONATE_HREF } from '@/components/public/nav'
import { ProductGrid } from '@/components/public/ProductGrid'
import { ProgramForms } from '@/components/public/ProgramForms'
import { OrToComplete, RichText } from '@/components/public/ToComplete'
import {
  getImpactMetrics,
  getProgramBySlug,
  getPublishedPosts,
  getPublishedPrograms,
  getPublishedProducts,
} from '@/lib/data/public'
import { slugParams } from '@/lib/static-params'

export async function generateStaticParams() {
  return slugParams((await getPublishedPrograms()).map((p) => p.slug))
}

export async function generateMetadata({
  params,
}: PageProps<'/nos-programmes/[slug]'>): Promise<Metadata> {
  const program = await getProgramBySlug((await params).slug)
  if (!program) return {}
  return {
    title: program.title,
    description: program.summary ?? undefined,
    openGraph: program.coverImageUrl ? { images: [program.coverImageUrl] } : undefined,
  }
}

const container = 'mx-auto max-w-7xl px-4 sm:px-6'

async function ProgramPageContent({ params }: Pick<PageProps<'/nos-programmes/[slug]'>, 'params'>) {
  const { slug } = await params
  const program = await getProgramBySlug(slug)
  if (!program) notFound()

  const [metrics, posts, products] = await Promise.all([
    getImpactMetrics(),
    getPublishedPosts(),
    getPublishedProducts(),
  ])
  const ownMetrics = metrics.filter((m) => m.programId === program.id)
  const ownPosts = posts.filter((p) => p.programId === program.id).slice(0, 3)
  const ownProducts = products.filter((p) => p.programId === program.id).slice(0, 4)

  return (
    <article>
      <PageHeader
        title={program.title}
        intro={program.summary ?? TO_COMPLETE}
        imageUrl={program.coverImageUrl}
        image={programImage(`${program.slug} ${program.title}`)}
        crumbs={[{ href: '/nos-programmes', label: 'Nos programmes' }]}
        meta={
          <div className="grid gap-5">
            <StatusBadge status={program.status} />
            <dl className="grid max-w-3xl gap-4 text-sm sm:grid-cols-2">
              <div className="min-w-0">
                <dt className="font-semibold text-orange-400">Zones d’intervention</dt>
                <dd className="mt-1 text-base break-words text-white">
                  <OrToComplete value={program.areas} />
                </dd>
              </div>
              <div className="min-w-0">
                <dt className="font-semibold text-orange-400">Bénéficiaires</dt>
                <dd className="mt-1 text-base break-words text-white">
                  <OrToComplete value={program.beneficiaries} />
                </dd>
              </div>
            </dl>
          </div>
        }
      />

      <div className={`${container} grid gap-10 py-14 md:py-20 lg:grid-cols-[1fr_20rem] lg:gap-16`}>
        <div className="max-w-[68ch] min-w-0">
          <RichText text={program.content} />
        </div>
        <aside className="border-border h-fit rounded-xl border bg-gray-50 p-6 shadow-sm">
          <p className="font-display text-heading text-xl font-extrabold">Soutenir ce programme</p>
          <p className="text-ink-soft mt-2 text-sm">
            Vous pouvez indiquer ce programme lors de votre déclaration de don.
          </p>
          <ButtonLink href={`${DONATE_HREF}?programme=${program.slug}`} className="mt-5">
            <HandHeart size={18} weight="fill" aria-hidden />
            Faire un don
          </ButtonLink>
        </aside>
      </div>

      <ProgramForms programId={program.id} />

      {program.gallery.length > 0 && (
        <section className="bg-white">
          <div className={`${container} py-14 md:py-20`}>
            <SectionHeading title="En images" />
            <div className="mt-10">
              <PhotoGallery
                images={program.gallery.map((src) => ({ src, alt: `Programme ${program.title}` }))}
                caption={program.title}
              />
            </div>
          </div>
        </section>
      )}

      {ownMetrics.length > 0 && (
        <section className="bg-gray-50">
          <div className={`${container} py-14 md:py-20`}>
            <SectionHeading title="Résultats" />
            <div className="mt-10">
              <MetricsGrid metrics={ownMetrics} />
            </div>
          </div>
        </section>
      )}

      {ownProducts.length > 0 && (
        <section className={`${container} py-14 md:py-20`}>
          <SectionHeading
            title="Fabriqué dans ce programme"
            href="/vitrine"
            linkLabel="Toute la Vitrine de l’entrepreneur"
          />
          <div className="mt-10">
            <ProductGrid products={ownProducts} />
          </div>
        </section>
      )}

      {ownPosts.length > 0 && (
        <section className={`${container} pb-14 md:pb-20`}>
          <SectionHeading title="Actualités du programme" href="/actualites" linkLabel="Toutes" />
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {ownPosts.map((post) => (
              <li key={post.id}>
                <PostCard post={post} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  )
}

export default function ProgramPage({ params }: PageProps<'/nos-programmes/[slug]'>) {
  return (
    <Suspense fallback={<div className="mx-auto h-[70vh] max-w-7xl" />}>
      <ProgramPageContent params={params} />
    </Suspense>
  )
}
