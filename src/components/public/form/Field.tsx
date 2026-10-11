import type { ReactNode } from 'react'

export const inputClass =
  'border-ink/25 bg-cream text-ink placeholder:text-ink-soft/80 focus:border-ink min-h-12 w-full rounded-full border px-5 text-base outline-none transition focus-visible:outline-2 focus-visible:outline-offset-2 aria-[invalid=true]:border-accent'

export const textareaClass =
  'border-ink/25 bg-cream text-ink placeholder:text-ink-soft/80 focus:border-ink w-full rounded-3xl border px-5 py-3 text-base outline-none transition focus-visible:outline-2 focus-visible:outline-offset-2'

interface FieldProps {
  id: string
  label: string
  error?: string
  hint?: string
  optional?: boolean
  children: ReactNode
}

/** Libellé au-dessus, aide et erreur en dessous (jamais de libellé dans le placeholder). */
export function Field({ id, label, error, hint, optional, children }: FieldProps) {
  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
        {optional && <span className="text-ink-soft font-normal"> (facultatif)</span>}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-ink-soft text-sm">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-accent text-sm font-semibold" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
