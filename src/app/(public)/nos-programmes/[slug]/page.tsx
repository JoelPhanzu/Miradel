import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { ArrowLeft, HandHeart } from '@phosphor-icons/react/ssr'
import { ButtonLink } from '@/components/public/ButtonLink'
import { MetricsGrid, PostCard, SectionHeading } from '@/components/public/cards'
import { DONATE_HREF } from '@/components/public/nav'
import { PhotoSlot } from '@/components/public/PhotoSlot'
import { ProductGrid } from '@/components/public/ProductGrid'
import { OrToComplete, RichText } from '@/components/public/ToComplete'
import { PROGRAM_STATUS_LABELS } from '@/lib/admin/labels'
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

const container = 'mx-auto max-w-[1320px] px-4 md:px-8'

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
      <header className={`${container} pt-8 pb-12`}>
        <Link
          href="/nos-programmes"
          className="text-ink-soft hover:text-ink inline-flex min-h-11 items-center gap-2 text-sm"
        >
          <ArrowLeft size={16} aria-hidden />
          Tous les programmes
        </Link>
        <div className="mt-6 grid gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-end">
          <div>
            <p className="rise text-ochre text-xs font-semibold tracking-[0.2em] uppercase">
              {PROGRAM_STATUS_LABELS[program.status]}
            </p>
            <h1 className="rise font-display mt-3 text-5xl leading-[1.02] font-medium tracking-tight md:text-7xl">
              {program.title}
            </h1>
            <p className="rise text-ink-soft mt-5 max-w-[52ch] text-lg">
              <OrToComplete value={program.summary} />
            </p>
          </div>
          <dl className="grid gap-4 text-sm">
            <div>
              <dt className="text-ink-soft font-semibold">Zones d’intervention</dt>
              <dd className="mt-1 text-base">
                <OrToComplete value={program.areas} />
              </dd>
            </div>
            <div>
              <dt className="text-ink-soft font-semibold">Bénéficiaires</dt>
              <dd className="mt-1 text-base">
                <OrToComplete value={program.beneficiaries} />
              </dd>
            </div>
          </dl>
        </div>
      </header>

      <div className={container}>
        <PhotoSlot
          src={program.coverImageUrl}
          alt={program.title}
          brief={`photo réelle du programme ${program.title}`}
          className="aspect-[16/9]"
          sizes="(min-width: 1320px) 1256px, 100vw"
          priority
        />
      </div>

      <div className={`${container} grid gap-12 py-16 md:grid-cols-[1fr_20rem] md:gap-20`}>
        <div className="max-w-[68ch]">
          <RichText text={program.content} />
        </div>
        <aside className="bg-accent-soft h-fit p-6">
          <p className="font-display text-2xl font-medium">Soutenir ce programme</p>
          <p className="text-ink-soft mt-2 text-sm">
            Vous pouvez indiquer ce programme lors de votre déclaration de don.
          </p>
          <ButtonLink href={`${DONATE_HREF}?programme=${program.slug}`} className="mt-5">
            <HandHeart size={18} aria-hidden />
            Faire un don
          </ButtonLink>
        </aside>
      </div>

      {program.gallery.length > 0 && (
        <section className={`${container} pb-16`}>
          <SectionHeading title="En images" />
          <ul className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3">
            {program.gallery.map((src) => (
              <li key={src} className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={src}
                  alt={`Programme ${program.title}`}
                  fill
                  sizes="(min-width: 768px) 33vw, 50vw"
                  className="object-cover"
                />
              </li>
            ))}
          </ul>
        </section>
      )}

      {ownMetrics.length > 0 && (
        <section className="bg-cream-deep">
          <div className={`${container} py-16`}>
            <SectionHeading title="Résultats" />
            <div className="mt-10">
              <MetricsGrid metrics={ownMetrics} />
            </div>
          </div>
        </section>
      )}

      {ownProducts.length > 0 && (
        <section className={`${container} py-16`}>
          <SectionHeading
            title="Fabriqué dans ce programme"
            href="/boutique"
            linkLabel="Toute la boutique"
          />
          <div className="mt-10">
            <ProductGrid products={ownProducts} />
          </div>
        </section>
      )}

      {ownPosts.length > 0 && (
        <section className={`${container} pb-24`}>
          <SectionHeading title="Actualités du programme" href="/actualites" linkLabel="Toutes" />
          <ul className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
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
    <Suspense fallback={<div className="mx-auto h-[70vh] max-w-[1320px]" />}>
      <ProgramPageContent params={params} />
    </Suspense>
  )
}
