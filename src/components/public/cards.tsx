/** Cartes et blocs partagés entre l'accueil et les pages intérieures. */
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  BookOpenText,
  FirstAidKit,
  HandHeart,
  Plant,
  Quotes,
  Tree,
} from '@phosphor-icons/react/ssr'
import { programImage } from '@/content/images'
import { PROGRAM_STATUS_LABELS } from '@/lib/admin/labels'
import { formatLongDate } from '@/lib/dates'
import { formatNumber } from '@/lib/format'
import type { ImpactMetric, Partner, Post, Program, Testimonial } from '@/types/content'
import { Emphasis } from './Emphasis'
import { IllustrationNote, PhotoSlot } from './PhotoSlot'
import { OrToComplete } from './ToComplete'

/** Carte : coins arrondis, bordure fine, ombre légère ; monte un peu au survol. */
export const cardClass =
  'group bg-white border-border flex h-full flex-col overflow-hidden rounded-xl border shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg'

/** Photo de carte : s'agrandit doucement au survol, sans déborder (overflow-hidden parent). */
export const cardImageClass = 'transition-transform duration-500 group-hover:scale-105'

/** Icône d'un programme, choisie d'après son intitulé. */
export function ProgramIcon({ name, size = 24 }: { name: string; size?: number }) {
  const s = name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  const props = { size, weight: 'fill' as const, 'aria-hidden': true }
  if (/agri|culture|champ|agro/.test(s)) return <Plant {...props} />
  if (/sante|clinique|medic|hygiene/.test(s)) return <FirstAidKit {...props} />
  if (/educ|ecole|scola|formation/.test(s)) return <BookOpenText {...props} />
  if (/environ|vert|climat|arbre/.test(s)) return <Tree {...props} />
  return <HandHeart {...props} />
}

const STATUS_BADGE: Record<Program['status'], string> = {
  en_cours: 'bg-green-50 text-green-700',
  termine: 'bg-gray-100 text-ink-700',
  en_preparation: 'bg-navy-100 text-navy-800',
}

export function StatusBadge({ status }: { status: Program['status'] }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${STATUS_BADGE[status]}`}
    >
      {PROGRAM_STATUS_LABELS[status]}
    </span>
  )
}

/** Carte « service » : photo 16/10, pastille d'icône qui chevauche, texte centré. */
export function ProgramCard({ program, priority }: { program: Program; priority?: boolean }) {
  const href = `/nos-programmes/${program.slug}`
  return (
    <article className={cardClass}>
      <Link href={href} tabIndex={-1} aria-hidden className="block overflow-hidden">
        <PhotoSlot
          src={program.coverImageUrl}
          alt=""
          brief={`action de terrain du programme ${program.title}`}
          fallback={programImage(`${program.slug} ${program.title}`)}
          className="aspect-[16/10]"
          imageClassName={cardImageClass}
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          priority={priority}
        />
      </Link>
      <div className="relative flex grow flex-col items-center px-5 pt-10 pb-6 text-center">
        <span
          className="bg-navy-900 absolute -top-7 left-1/2 flex size-14 -translate-x-1/2 items-center justify-center rounded-full border-4 border-white text-white shadow-md"
          aria-hidden
        >
          <ProgramIcon name={`${program.slug} ${program.title}`} />
        </span>
        <StatusBadge status={program.status} />
        <h3 className="font-display text-heading mt-3 text-xl leading-tight font-extrabold">
          <Link href={href} className="hover:text-orange-700">
            {program.title}
          </Link>
        </h3>
        <p className="text-ink-soft mt-2 text-sm">
          <OrToComplete value={program.summary} />
        </p>
        <Link
          href={href}
          className="mt-auto inline-flex min-h-11 items-center gap-2 pt-3 text-sm font-bold text-orange-700 hover:text-orange-600"
          aria-label={`Découvrir le programme ${program.title}`}
        >
          Découvrir
          <ArrowRight size={16} weight="bold" aria-hidden />
        </Link>
      </div>
    </article>
  )
}

export function PostCard({ post, programTitle }: { post: Post; programTitle?: string | null }) {
  const href = `/actualites/${post.slug}`
  return (
    <article className={cardClass}>
      <Link href={href} tabIndex={-1} aria-hidden className="block overflow-hidden">
        <PhotoSlot
          src={post.imageUrl}
          alt=""
          brief="photo de l’action"
          className="aspect-[16/10]"
          imageClassName={cardImageClass}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        />
      </Link>
      <div className="flex grow flex-col p-5">
        <p className="text-ink-soft text-sm">
          <time dateTime={post.publishedAt}>{formatLongDate(post.publishedAt)}</time>
          {programTitle && <span> · {programTitle}</span>}
        </p>
        <h3 className="font-display text-heading mt-1 text-xl leading-tight font-extrabold">
          <Link href={href} className="hover:text-orange-700">
            {post.title}
          </Link>
        </h3>
        {post.excerpt && <p className="text-ink-soft mt-2 text-sm">{post.excerpt}</p>}
        <Link
          href={href}
          className="mt-auto inline-flex min-h-11 items-center gap-2 pt-3 text-sm font-bold text-orange-700 hover:text-orange-600"
          aria-label={`Lire : ${post.title}`}
        >
          Lire la suite
          <ArrowRight size={16} weight="bold" aria-hidden />
        </Link>
      </div>
    </article>
  )
}

/** Chiffres clés : grands nombres, pastille verte, libellé et période. */
export function MetricsGrid({ metrics }: { metrics: ImpactMetric[] }) {
  return (
    <dl className="grid grid-cols-1 gap-4 min-[400px]:grid-cols-2 lg:grid-cols-4">
      {metrics.map((m) => (
        <div
          key={m.id}
          data-reveal
          className="border-border min-w-0 rounded-xl border bg-white p-5 shadow-sm"
        >
          <dt className="sr-only">{m.label}</dt>
          <dd className="font-display text-navy-800 flex flex-wrap items-baseline gap-x-1 text-4xl leading-none font-extrabold break-words md:text-5xl">
            {formatNumber(m.value)}
            {m.unit && <span className="text-xl text-orange-700 md:text-2xl">{m.unit}</span>}
          </dd>
          <dd className="text-ink mt-3 flex items-start gap-2 font-semibold">
            <span className="mt-2 size-2 shrink-0 rounded-full bg-green-500" aria-hidden />
            <span className="min-w-0">{m.label}</span>
          </dd>
          {m.period && <dd className="text-ink-soft mt-1 pl-4 text-sm">{m.period}</dd>}
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
          <figure className="border-border flex h-full flex-col rounded-xl border bg-white p-6 shadow-sm md:p-8">
            <Quotes size={32} weight="duotone" className="text-orange-500" aria-hidden />
            <blockquote className="text-ink mt-4 text-lg leading-snug">{t.body}</blockquote>
            <figcaption className="text-ink-soft mt-auto pt-6 text-sm">
              <span className="text-navy-800 font-bold">{t.displayName}</span>
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
          <span className="font-display text-navy-800 flex aspect-[3/2] items-center justify-center text-center text-base font-bold break-words">
            {p.name}
          </span>
        )
        return (
          <li
            key={p.id}
            className="border-border min-w-0 rounded-xl border bg-white p-4 shadow-sm transition hover:shadow-md"
          >
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

/** Petit motif décoratif : un carré orange suivi d'un trait orange. */
export function Kicker({ className = '' }: { className?: string }) {
  return (
    <span className={`flex items-center gap-1.5 ${className}`} aria-hidden>
      <span className="size-2.5 bg-orange-500" />
      <span className="h-0.5 w-10 bg-orange-500" />
    </span>
  )
}

/** Titre de section centré, encadré de deux traits orange, avec sous-titre et lien. */
export function SectionHeading({
  title,
  intro,
  href,
  linkLabel,
  as: Tag = 'h2',
}: {
  title: string
  intro?: string | null
  href?: string | null
  linkLabel?: string | null
  as?: 'h2' | 'h3'
}) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center text-center" data-reveal>
      <Kicker className="mb-4" />
      <div className="flex w-full items-center justify-center gap-4">
        <span className="hidden h-0.5 w-12 shrink-0 bg-orange-500 sm:block md:w-20" aria-hidden />
        <Tag className="font-display text-heading min-w-0 text-2xl leading-tight font-extrabold md:text-4xl">
          <Emphasis text={title} />
        </Tag>
        <span className="hidden h-0.5 w-12 shrink-0 bg-orange-500 sm:block md:w-20" aria-hidden />
      </div>
      {intro && <p className="text-ink-soft mt-4 max-w-[60ch] font-semibold">{intro}</p>}
      {href && linkLabel && (
        <Link
          href={href}
          className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-orange-700 hover:text-orange-600"
        >
          {linkLabel}
          <ArrowRight size={16} weight="bold" aria-hidden />
        </Link>
      )}
    </div>
  )
}

/** Galerie « réalisations » : vignettes 4/3, dégradé bleu marine en bas, légende en blanc. */
export function PhotoGallery({
  images,
  caption,
  illustration,
}: {
  images: { src: string; alt: string }[]
  caption?: string
  illustration?: boolean
}) {
  return (
    <ul className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
      {images.map((img) => (
        <li
          key={img.src}
          data-reveal
          className="group relative aspect-[4/3] overflow-hidden rounded-xl"
        >
          <Image
            src={img.src}
            alt={img.alt}
            fill
            sizes="(min-width: 768px) 25vw, 50vw"
            className={`object-cover ${cardImageClass}`}
          />
          {illustration && <IllustrationNote className="top-2 right-2" />}
          {caption && (
            <>
              <span
                className="from-navy-950/85 absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t to-transparent"
                aria-hidden
              />
              <span className="absolute inset-x-3 bottom-2 line-clamp-2 text-sm font-semibold text-white">
                {caption}
              </span>
            </>
          )}
        </li>
      ))}
    </ul>
  )
}
