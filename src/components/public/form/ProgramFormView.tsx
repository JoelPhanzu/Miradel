'use client'

import Link from 'next/link'
import { useState, type FormEvent } from 'react'
import type { FormFieldDef } from '@/db/schema'
import { antiSpamPayload, Honeypot, useStartedAt } from './AntiSpamFields'
import { Field, inputClass, textareaClass } from './Field'

const INPUT_TYPES = {
  text: 'text',
  tel: 'tel',
  email: 'email',
  number: 'text',
  date: 'date',
} as const

/** Formulaire de participation : champs définis dans l'admin, envoi vers /api/participations. */
export function ProgramFormView({
  formId,
  fields,
  successMessage,
}: {
  formId: string
  fields: FormFieldDef[]
  successMessage: string | null
}) {
  const startedAt = useStartedAt()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [pending, setPending] = useState(false)
  const [done, setDone] = useState(false)
  const id = (fieldId: string) => `${formId}-${fieldId}`

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const answers: Record<string, string | string[] | boolean> = {}
    for (const f of fields) {
      if (f.type === 'checkboxes') answers[f.id] = form.getAll(f.id).map(String)
      else if (f.type === 'consent') answers[f.id] = form.get(f.id) === 'on'
      else answers[f.id] = String(form.get(f.id) ?? '')
    }
    setPending(true)
    setErrors({})
    try {
      const response = await fetch('/api/participations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formId, answers, ...antiSpamPayload(form, startedAt) }),
      })
      const result = await response.json()
      if (!result.ok) setErrors(result.errors ?? { form: 'Vérifiez le formulaire.' })
      else setDone(true)
    } catch {
      setErrors({ form: 'Connexion perdue. Votre saisie est conservée : réessayez.' })
    } finally {
      setPending(false)
    }
  }

  if (done) {
    return (
      <p role="status" className="bg-accent-soft rounded-2xl p-6 text-lg font-semibold">
        {successMessage ||
          'Merci, votre participation a bien été enregistrée. L’équipe vous recontacte.'}
      </p>
    )
  }

  const errorText = (fieldId: string) =>
    errors[fieldId] && (
      <p id={`${id(fieldId)}-error`} role="alert" className="text-accent text-sm font-semibold">
        {errors[fieldId]}
      </p>
    )

  return (
    <form onSubmit={onSubmit} noValidate className="relative grid gap-6">
      <Honeypot />
      {fields.map((f) => {
        const error = errors[f.id]
        const describedBy = error ? `${id(f.id)}-error` : f.help ? `${id(f.id)}-hint` : undefined
        const common = {
          id: id(f.id),
          name: f.id,
          required: f.required,
          'aria-invalid': Boolean(error),
          'aria-describedby': describedBy,
        }

        if (f.type === 'consent') {
          return (
            <div key={f.id} className="grid gap-2">
              <label className="flex min-h-11 items-start gap-3">
                <input type="checkbox" {...common} className="accent-accent mt-1 size-5 shrink-0" />
                <span>{f.label}</span>
              </label>
              {f.help && !error && (
                <p id={`${id(f.id)}-hint`} className="text-ink-soft text-sm">
                  {f.help}
                </p>
              )}
              {errorText(f.id)}
            </div>
          )
        }

        if (f.type === 'radio' || f.type === 'checkboxes') {
          return (
            <fieldset key={f.id} className="grid gap-2" aria-describedby={describedBy}>
              <legend className="mb-2 text-sm font-semibold">
                {f.label}
                {!f.required && <span className="text-ink-soft font-normal"> (facultatif)</span>}
              </legend>
              <div className="grid gap-1 sm:grid-cols-2">
                {f.options?.map((option) => (
                  <label key={option} className="flex min-h-11 items-center gap-3">
                    <input
                      type={f.type === 'radio' ? 'radio' : 'checkbox'}
                      name={f.id}
                      value={option}
                      className="accent-accent size-5 shrink-0"
                    />
                    {option}
                  </label>
                ))}
              </div>
              {f.help && !error && (
                <p id={`${id(f.id)}-hint`} className="text-ink-soft text-sm">
                  {f.help}
                </p>
              )}
              {errorText(f.id)}
            </fieldset>
          )
        }

        return (
          <Field
            key={f.id}
            id={id(f.id)}
            label={f.label}
            optional={!f.required}
            hint={f.help ?? undefined}
            error={error}
          >
            {f.type === 'textarea' ? (
              <textarea rows={5} {...common} className={textareaClass} />
            ) : f.type === 'select' ? (
              <select {...common} defaultValue="" className={inputClass}>
                <option value="" disabled>
                  Choisir…
                </option>
                {f.options?.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            ) : (
              <input
                type={INPUT_TYPES[f.type]}
                inputMode={f.type === 'number' ? 'decimal' : f.type === 'tel' ? 'tel' : undefined}
                autoComplete={f.type === 'tel' ? 'tel' : f.type === 'email' ? 'email' : undefined}
                {...common}
                className={inputClass}
              />
            )}
          </Field>
        )
      })}
      <p className="text-ink-soft text-sm">
        Vos réponses servent uniquement à l’organisation de ce programme.{' '}
        <Link href="/politique-de-confidentialite" className="underline underline-offset-4">
          Politique de confidentialité
        </Link>
      </p>
      {(errors.form || Object.keys(errors).length > 0) && (
        <p role="alert" className="text-accent font-semibold">
          {errors.form ?? 'Vérifiez les champs signalés.'}
        </p>
      )}
      <div>
        <button
          type="submit"
          disabled={pending}
          className="bg-accent text-accent-ink hover:bg-ink hover:text-cream inline-flex min-h-12 items-center rounded-full px-8 text-sm font-semibold transition active:scale-[0.98] disabled:opacity-60"
        >
          {pending ? 'Envoi…' : 'Envoyer ma participation'}
        </button>
      </div>
    </form>
  )
}
