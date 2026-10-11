import type { ReactNode } from 'react'
import { Emphasis } from './Emphasis'

interface PageHeaderProps {
  title: string
  intro?: string | null
  children?: ReactNode
}

/** En-tête des pages intérieures : grand titre, introduction courte. */
export function PageHeader({ title, intro, children }: PageHeaderProps) {
  return (
    <header className="mx-auto max-w-[1320px] px-4 pt-14 pb-10 md:px-8 md:pt-20 md:pb-14">
      <h1 className="rise font-display pb-1 text-5xl leading-[1.02] font-medium tracking-tight md:text-7xl">
        <Emphasis text={title} />
      </h1>
      {intro && (
        <p
          className="rise text-ink-soft mt-5 max-w-[52ch] text-lg"
          style={{ '--i': 1 } as React.CSSProperties}
        >
          {intro}
        </p>
      )}
      {children}
    </header>
  )
}
