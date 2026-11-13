import Image from 'next/image'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { CaretRight } from '@phosphor-icons/react/ssr'
import type { StockImage } from '@/content/images'
import { Emphasis } from './Emphasis'
import { IllustrationNote } from './PhotoSlot'
import { OrToComplete } from './ToComplete'

export interface Crumb {
  href?: string
  label: string
}

/** Fil d'Ariane : Accueil › … › page courante (aria-current), passe à la ligne si long. */
export function Breadcrumbs({ items, onDark }: { items: Crumb[]; onDark?: boolean }) {
  const all: Crumb[] = [{ href: '/', label: 'Accueil' }, ...items]
  const base = onDark ? 'text-white/80' : 'text-ink-soft'
  return (
    <nav aria-label="Fil d’Ariane">
      <ol className={`flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm ${base}`}>
        {all.map((c, i) => {
          const last = i === all.length - 1
          return (
            <li key={`${c.label}-${i}`} className="flex min-w-0 items-center gap-1.5">
              {c.href && !last ? (
                <Link
                  href={c.href}
                  className={`break-words underline-offset-4 hover:underline ${onDark ? 'hover:text-white' : 'hover:text-ink'}`}
                >
                  {c.label}
                </Link>
              ) : (
                <span
                  aria-current={last ? 'page' : undefined}
                  className="font-semibold break-words"
                >
                  {c.label}
                </span>
              )}
              {!last && <CaretRight size={12} weight="bold" className="shrink-0" aria-hidden />}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

interface PageHeaderProps {
  title: string
  intro?: string | null
  /** Photo propre à la page : vraie photo (admin) ou illustration provisoire. */
  image?: StockImage | null
  /** Vraie photo saisie dans l'admin (prioritaire sur `image`). */
  imageUrl?: string | null
  /** Étapes intermédiaires du fil d'Ariane (la page courante est ajoutée automatiquement). */
  crumbs?: Crumb[]
  /** Contenu sous le titre, dans le bandeau (étiquettes, informations). */
  meta?: ReactNode
  /** Contenu placé sous le bandeau, sur fond blanc (recherche, liens). */
  children?: ReactNode
}

/**
 * Bannière des pages intérieures : photo de la page (opacité 40 %) sous un dégradé bleu marine,
 * fil d'Ariane, titre H1 et trait orange.
 */
export function PageHeader({
  title,
  intro,
  image,
  imageUrl,
  crumbs = [],
  meta,
  children,
}: PageHeaderProps) {
  const photo = imageUrl ? { src: imageUrl, alt: '', position: undefined } : image
  const plainTitle = title.replace(/\*/g, '')
  return (
    <>
      <header className="on-navy relative isolate overflow-hidden">
        {photo && (
          <>
            <Image
              src={photo.src}
              alt=""
              fill
              preload
              sizes="100vw"
              className={`-z-20 object-cover opacity-40 ${photo.position ?? ''}`}
            />
            {!imageUrl && <IllustrationNote className="right-3 bottom-3" />}
          </>
        )}
        <div
          className="from-navy-900 via-navy-900/85 to-navy-900/40 absolute inset-0 -z-10 bg-gradient-to-r"
          aria-hidden
        />
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-20">
          <Breadcrumbs items={[...crumbs, { label: plainTitle }]} onDark />
          <h1 className="rise font-display mt-4 max-w-4xl text-3xl leading-[1.1] font-extrabold text-white md:text-5xl">
            <Emphasis text={title} onDark />
          </h1>
          <span className="mt-5 block h-1 w-24 rounded-full bg-orange-500" aria-hidden />
          {intro && (
            <p
              className="rise mt-5 max-w-[60ch] text-base text-white/95 md:text-lg"
              style={{ '--i': 1 } as React.CSSProperties}
            >
              <OrToComplete value={intro} />
            </p>
          )}
          {meta && <div className="mt-6">{meta}</div>}
        </div>
      </header>
      {children && <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 md:pt-10">{children}</div>}
    </>
  )
}
