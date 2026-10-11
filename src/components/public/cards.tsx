/** Cartes et blocs partagés entre l'accueil et les pages intérieures. */
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Quotes } from '@phosphor-icons/react/ssr'
import { PROGRAM_STATUS_LABELS } from '@/lib/admin/labels'
import { formatLongDate } from '@/lib/dates'
import { formatNumber } from '@/lib/format'
import type { ImpactMetric, Partner, Post, Program, Testimonial } from '@/types/content'
import { PhotoSlot } from './PhotoSlot'
import { OrToComplete } from './ToComplete'

export function ProgramCard({ program, priority }: { program: Program; priority?: boolean }) {
  return (
    <article className="group flex h-full flex-col">
      <Link href={`/nos-programmes/${program.slug}`} className="block overflow-hidden">
        <PhotoSlot
          src={program.coverImageUrl}
          alt={program.title}
          brief={`action de terrain du programme ${program.title}`}
          className="aspect-[4/3] transition duration-700 group-hover:scale-[1.03]"
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          priority={priority}
        />
      </Link>
      <p className="text-ochre mt-4 text-xs font-semibold tracking-[0.14em] uppercase">
        {PROGRAM_STATUS_LABELS[program.status]}
      </p>
      <h3 className="font-display mt-1 text-2xl leading-tight font-semibold">
        <Link href={`/nos-programmes/${program.slug}`} className="hover:text-accent">
          {program.title}
        </Link>
      </h3>
      <p className="text-ink-soft mt-2">
        <OrToComplete value={program.summary} />
      </p>
      <Link
        href={`/nos-programmes/${program.slug}`}
        className="text-accent mt-auto inline-flex min-h-11 items-center gap-2 pt-3 text-sm font-semibold"
        aria-label={`Découvrir le programme ${program.title}`}
      >
        Découvrir
        <ArrowRight size={16} aria-hidden />
      </Link>
    </article>
  )
}

export function PostCard({ post, programTitle }: { post: Post; programTitle?: string | null }) {
  return (
    <article className="group flex h-full flex-col">
      <Link href={`/actualites/${post.slug}`} className="block overflow-hidden">
        <PhotoSlot
          src={post.imageUrl}
          alt={post.title}
          brief="photo de l’action"
          className="aspect-[3/2] transition duration-700 group-hover:scale-[1.03]"
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        />
      </Link>
      <p className="text-ink-soft mt-4 text-sm">
        <time dateTime={post.publishedAt}>{formatLongDate(post.publishedAt)}</time>
        {programTitle && <span> · {programTitle}</span>}
      </p>
      <h3 className="font-display mt-1 text-2xl leading-tight font-semibold">
        <Link href={`/actualites/${post.slug}`} className="hover:text-accent">
          {post.title}
        </Link>
      </h3>
      {post.excerpt && <p className="text-ink-soft mt-2">{post.excerpt}</p>}
    </article>
  )
}

/** Chiffres clés : grands nombres, libellé et période. */
export function MetricsGrid({ metrics }: { metrics: ImpactMetric[] }) {
  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
      {metrics.map((m) => (
        <div key={m.id} data-reveal className="border-ink/15 border-t pt-5">
          <dt className="sr-only">{m.label}</dt>
          <dd className="font-display text-5xl leading-none font-semibold md:text-6xl">
            {formatNumber(m.value)}
            {m.unit && <span className="text-ochre ml-1 text-2xl md:text-3xl">{m.unit}</span>}
          </dd>
          <dd className="mt-3 font-semibold">{m.label}</dd>
          {m.period && <dd className="text-ink-soft text-sm">{m.period}</dd>}
        </div>
      ))}
    </dl>
  )
}

export function TestimonialList({ testimonials }: { testimonials: Testimonial[] }) {
  return (
    <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {testimonials.map((t) => (
        <li key={t.id} data-reveal>
          <figure className="bg-cream-deep flex h-full flex-col p-6 md:p-8">
            <Quotes size={32} weight="fill" className="text-ochre" aria-hidden />
            <blockquote className="font-display mt-4 text-xl leading-snug">{t.body}</blockquote>
            <figcaption className="text-ink-soft mt-auto pt-6 text-sm">
              <span className="text-ink font-semibold">{t.displayName}</span>
              {t.programTitle && <span> · {t.programTitle}</span>}
            </figcaption>
          </figure>
        </li>
      ))}
    </ul>
  )
}

export function PartnerList({ partners }: { partners: Partner[] }) {
  return (
    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {partners.map((p) => {
        const content = p.logoUrl ? (
          <span className="relative block aspect-[3/2]">
            <Image src={p.logoUrl} alt={p.name} fill sizes="200px" className="object-contain" />
          </span>
        ) : (
          <span className="font-display flex aspect-[3/2] items-center justify-center text-center text-lg font-semibold">
            {p.name}
          </span>
        )
        return (
          <li key={p.id} className="border-line border p-4">
            {p.websiteUrl ? (
              <a href={p.websiteUrl} target="_blank" rel="noopener noreferrer" title={p.name}>
                {content}
              </a>
            ) : (
              content
            )}
          </li>
        )
      })}
    </ul>
  )
}

/** Titre de section avec lien « Tout voir ». */
export function SectionHeading({
  title,
  intro,
  href,
  linkLabel,
}: {
  title: string
  intro?: string | null
  href?: string | null
  linkLabel?: string | null
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-6" data-reveal>
      <div>
        <h2 className="font-display text-4xl leading-tight font-medium md:text-5xl">{title}</h2>
        {intro && <p className="text-ink-soft mt-3 max-w-[56ch] text-lg">{intro}</p>}
      </div>
      {href && linkLabel && (
        <Link
          href={href}
          className="text-accent inline-flex min-h-11 items-center gap-2 text-sm font-semibold"
        >
          {linkLabel}
          <ArrowRight size={16} aria-hidden />
        </Link>
      )}
    </div>
  )
}
