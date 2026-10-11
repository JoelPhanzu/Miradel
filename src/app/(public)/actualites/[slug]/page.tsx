import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { ArrowLeft, HandHeart } from '@phosphor-icons/react/ssr'
import { ButtonLink } from '@/components/public/ButtonLink'
import { DONATE_HREF } from '@/components/public/nav'
import { PhotoSlot } from '@/components/public/PhotoSlot'
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
    <article className="mx-auto max-w-[1320px] px-4 pt-8 pb-24 md:px-8">
      <Link
        href="/actualites"
        className="text-ink-soft hover:text-ink inline-flex min-h-11 items-center gap-2 text-sm"
      >
        <ArrowLeft size={16} aria-hidden />
        Toutes les actualités
      </Link>
      <header className="mx-auto mt-8 max-w-3xl">
        <p className="text-ink-soft text-sm">
          <time dateTime={post.publishedAt}>{formatLongDate(post.publishedAt)}</time>
          {program && (
            <>
              {' · '}
              <Link href={`/nos-programmes/${program.slug}`} className="underline underline-offset-4">
                {program.title}
              </Link>
            </>
          )}
        </p>
        <h1 className="rise font-display mt-4 pb-1 text-5xl leading-[1.04] font-medium tracking-tight md:text-6xl">
          {post.title}
        </h1>
        {post.excerpt && <p className="text-ink-soft mt-6 text-xl">{post.excerpt}</p>}
      </header>
      {post.imageUrl && (
        <PhotoSlot
          src={post.imageUrl}
          alt={post.title}
          brief=""
          className="mx-auto mt-12 aspect-[16/9] max-w-5xl"
          sizes="(min-width: 1024px) 1024px, 100vw"
          priority
        />
      )}
      <div className="mx-auto mt-12 max-w-[68ch]">
        {post.content && <SimpleMarkdown text={post.content} />}
        <ButtonLink href={DONATE_HREF} className="mt-14">
          <HandHeart size={18} aria-hidden />
          Soutenir nos actions
        </ButtonLink>
      </div>
    </article>
  )
}

export default function PostPage({ params }: PageProps<'/actualites/[slug]'>) {
  return (
    <Suspense fallback={<div className="mx-auto h-[70vh] max-w-[1320px]" />}>
      <Article params={params} />
    </Suspense>
  )
}
