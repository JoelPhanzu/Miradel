import Image from 'next/image'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { ArrowLeft, Plus } from '@phosphor-icons/react/ssr'

export function AdminPage({
  title,
  description,
  back,
  action,
  children,
}: {
  title: string
  description?: string
  back?: { href: string; label: string }
  action?: { href: string; label: string }
  children: ReactNode
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-6 pb-44 md:px-8 md:pt-10 md:pb-32">
      {back && (
        <Link
          href={back.href}
          className="text-ink-soft inline-flex min-h-11 items-center gap-2 text-sm"
        >
          <ArrowLeft size={16} aria-hidden />
          {back.label}
        </Link>
      )}
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl leading-tight font-semibold md:text-5xl">{title}</h1>
          {description && <p className="text-ink-soft mt-2 max-w-[60ch]">{description}</p>}
        </div>
        {action && <AddButton href={action.href} label={action.label} />}
      </div>
      <div className="mt-8">{children}</div>
    </div>
  )
}

export function AddButton({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="bg-accent text-accent-ink inline-flex min-h-12 items-center gap-2 rounded-full px-5 text-sm font-semibold"
    >
      <Plus size={18} aria-hidden />
      {label}
    </Link>
  )
}

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode
  tone?: 'neutral' | 'success' | 'warning' | 'muted'
}) {
  const tones = {
    neutral: 'bg-cream-deep text-ink',
    success: 'bg-whatsapp/15 text-whatsapp',
    warning: 'bg-accent-soft text-accent',
    muted: 'border-line text-ink-soft border',
  }
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${tones[tone]}`}>
      {children}
    </span>
  )
}

export function EmptyState({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="border-line rounded-3xl border border-dashed p-8 text-center">
      <p className="text-ink-soft">{children}</p>
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  )
}

/** Ligne de liste cliquable, grande zone tactile. */
export function ListRow({
  href,
  title,
  subtitle,
  aside,
  image,
}: {
  href: string
  title: ReactNode
  subtitle?: ReactNode
  aside?: ReactNode
  image?: ReactNode
}) {
  return (
    <Link
      href={href}
      className="hover:bg-cream-deep flex min-h-16 items-center gap-4 px-2 py-3 transition-colors md:px-4"
    >
      {image}
      <span className="min-w-0 grow">
        <span className="block truncate font-semibold">{title}</span>
        {subtitle && <span className="text-ink-soft block truncate text-sm">{subtitle}</span>}
      </span>
      {aside && (
        <span className="flex shrink-0 flex-col items-end gap-1 text-right text-sm">{aside}</span>
      )}
    </Link>
  )
}

export function ListCard({ children }: { children: ReactNode }) {
  return <ul className="divide-line border-line divide-y rounded-3xl border">{children}</ul>
}

export function Thumb({ src }: { src: string | null | undefined }) {
  return (
    <span className="bg-cream-deep relative size-12 shrink-0 overflow-hidden rounded-xl">
      {src && <Image src={src} alt="" fill sizes="48px" className="object-cover" />}
    </span>
  )
}
