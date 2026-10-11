import type { Metadata } from 'next'
import { PostCard } from '@/components/public/cards'
import { PageHeader } from '@/components/public/PageHeader'
import { getPageSections, getPublishedPosts, getPublishedPrograms } from '@/lib/data/public'

export const metadata: Metadata = {
  title: 'Actualités',
  description: 'Les actions de la Fondation MIRADEL FEVEPA sur le terrain, datées et illustrées.',
}

export default async function NewsPage() {
  const [{ news_intro: intro }, posts, programs] = await Promise.all([
    getPageSections(),
    getPublishedPosts(),
    getPublishedPrograms(),
  ])
  const programTitle = new Map(programs.map((p) => [p.id, p.title]))

  return (
    <>
      <PageHeader title={intro?.title ?? 'Actualités'} intro={intro?.body} />
      <div className="mx-auto max-w-[1320px] px-4 pb-24 md:px-8">
        {posts.length === 0 ? (
          <p className="text-ink-soft border-line border p-6 md:p-10">
            Les premières actualités arrivent bientôt.
          </p>
        ) : (
          <ul className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <li key={post.id} data-reveal>
                <PostCard
                  post={post}
                  programTitle={post.programId ? programTitle.get(post.programId) : null}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}
