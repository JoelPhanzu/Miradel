import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { HandHeart } from '@phosphor-icons/react/ssr'
import { ButtonLink } from '@/components/public/ButtonLink'
import { DONATE_HREF } from '@/components/public/nav'
import { PageHeader } from '@/components/public/PageHeader'
import { PhotoSlot } from '@/components/public/PhotoSlot'
import { IMAGES } from '@/content/images'
import { SimpleMarkdown } from '@/components/public/SimpleMarkdown'
import { formatLongDate } from '@/lib/dates'
import { getPostBySlug, getPublishedPosts, getPublishedPrograms } from '@/lib/data/public'
import { slugParams } from '@/lib/static-params'

export async function generateStaticParams() {
  return slugParams((await getPublishedPosts()).map((p) => p.slug))
}

export async function generateMetadata({
  params,
}: PageProps<'/actualites/[slug]'>): Promise<Metadata> {
  const post = await getPostBySlug((await params).slug)
  if (!post) return {}
  return {
    title: post.seoTitle ?? post.title,
    description: post.seoDescription ?? post.excerpt ?? undefined,
    openGraph: {
      type: 'article',
      publishedTime: post.publishedAt,
      images: post.imageUrl ? [post.imageUrl] : undefined,
    },
  }
}

async function Article({ params }: Pick<PageProps<'/actualites/[slug]'>, 'params'>) {
  const [post, programs] = await Promise.all([
    getPostBySlug((await params).slug),
    getPublishedPrograms(),
  ])
  if (!post) notFound()
  const program = programs.find((p) => p.id === post.programId)

  return (
    <article>
      <PageHeader
        title={post.title}
        intro={post.excerpt}
        imageUrl={post.imageUrl}
        image={IMAGES.pages.actualites}
        crumbs={[{ href: '/actualites', label: 'Actualités' }]}
        meta={
          <p className="text-sm text-white/90">
            <time dateTime={post.publishedAt}>{formatLongDate(post.publishedAt)}</time>
            {program && (
              <>
                {' · '}
                <Link
                  href={`/nos-programmes/${program.slug}`}
                  className="font-semibold text-orange-400 underline underline-offset-4 hover:text-orange-300"
                >
                  {program.title}
                </Link>
              </>
            )}
          </p>
        }
      />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 md:py-14">
        {post.imageUrl && (
          <PhotoSlot
            src={post.imageUrl}
            alt={post.title}
            brief=""
            className="mx-auto aspect-[16/9] max-w-5xl rounded-xl"
            sizes="(min-width: 1024px) 1024px, 100vw"
            priority
          />
        )}
        <div className="mx-auto mt-12 max-w-[68ch]">
          {post.content && <SimpleMarkdown text={post.content} />}
          <ButtonLink href={DONATE_HREF} className="mt-14">
            <HandHeart size={18} weight="fill" aria-hidden />
            Soutenir nos actions
          </ButtonLink>
        </div>
      </div>
    </article>
  )
}

export default function PostPage({ params }: PageProps<'/actualites/[slug]'>) {
  return (
    <Suspense fallback={<div className="mx-auto h-[70vh] max-w-7xl" />}>
      <Article params={params} />
    </Suspense>
  )
}
