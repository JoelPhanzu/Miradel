import { Fragment } from 'react'
import { TO_COMPLETE } from '@/db/seed-data'
import { SimpleMarkdown } from './SimpleMarkdown'

/** Vrai si le texte manque ou n'est qu'une mention « [À COMPLÉTER] ». */
export function isMissing(value: string | null | undefined): boolean {
  return !value || value.trim() === TO_COMPLETE
}

/**
 * Affiche une valeur, ou la mention « [À COMPLÉTER] » bien visible si elle manque
 * (CLAUDE.md §16 : ne jamais inventer).
 */
export function OrToComplete({ value }: { value: string | null | undefined }) {
  if (isMissing(value)) return <ToCompleteMark />
  const parts = value!.split(TO_COMPLETE)
  return parts.map((part, i) => (
    <Fragment key={i}>
      {part}
      {i < parts.length - 1 && <ToCompleteMark />}
    </Fragment>
  ))
}

export function ToCompleteMark() {
  return <span className="to-complete rounded px-1.5 py-0.5 text-sm">{TO_COMPLETE}</span>
}

/** Texte long (Markdown simple) ; la mention [À COMPLÉTER] reste mise en évidence. */
export function RichText({ text }: { text: string | null | undefined }) {
  if (isMissing(text)) return <ToCompleteMark />
  return <SimpleMarkdown text={text!} />
}
