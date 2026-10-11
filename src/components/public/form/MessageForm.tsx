'use client'

import Link from 'next/link'
import { useState, type FormEvent } from 'react'
import { antiSpamPayload, Honeypot, useStartedAt } from './AntiSpamFields'
import { Field, inputClass, textareaClass } from './Field'

type Kind = 'contact' | 'benevolat' | 'partenariat'

const TEXTS: Record<Kind, { message: string; submit: string; done: string }> = {
  contact: {
    message: 'Votre message',
    submit: 'Envoyer le message',
    done: 'Merci, votre message a bien été envoyé. Nous vous répondrons rapidement.',
  },
  benevolat: {
    message: 'Vos disponibilités et ce que vous souhaitez apporter',
    submit: 'Proposer mon aide',
    done: 'Merci pour votre proposition ! L’équipe vous recontacte.',
  },
  partenariat: {
    message: 'Votre proposition de partenariat',
    submit: 'Envoyer la proposition',
    done: 'Merci, votre proposition a bien été transmise à l’équipe.',
  },
}

/** Formulaire de contact, de bénévolat ou de partenariat (enregistré dans l'admin > Messages). */
export function MessageForm({ kind }: { kind: Kind }) {
  const startedAt = useStartedAt()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [pending, setPending] = useState(false)
  const [done, setDone] = useState(false)
  const text = TEXTS[kind]
  const id = (name: string) => `${kind}-${name}`

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setPending(true)
    setErrors({})
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind,
          fullName: String(form.get('fullName') ?? ''),
          phone: String(form.get('phone') ?? ''),
          email: String(form.get('email') ?? ''),
          organization: String(form.get('organization') ?? ''),
          message: String(form.get('message') ?? ''),
          ...antiSpamPayload(form, startedAt),
        }),
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
      <p role="status" className="bg-accent-soft p-6 text-lg font-semibold">
        {text.done}
      </p>
    )
  }

  const describedBy = (name: string) => (errors[name] ? `${id(name)}-error` : undefined)

  return (
    <form onSubmit={onSubmit} noValidate className="relative grid gap-6">
      <Honeypot />
      <div className="grid gap-6 sm:grid-cols-2">
        <Field id={id('fullName')} label="Nom complet" error={errors.fullName}>
          <input
            id={id('fullName')}
            name="fullName"
            autoComplete="name"
            required
            aria-invalid={Boolean(errors.fullName)}
            aria-describedby={describedBy('fullName')}
            className={inputClass}
          />
        </Field>
        {kind === 'partenariat' && (
          <Field id={id('organization')} label="Organisation" optional>
            <input
              id={id('organization')}
              name="organization"
              autoComplete="organization"
              className={inputClass}
            />
          </Field>
        )}
        <Field
          id={id('phone')}
          label="Téléphone (WhatsApp)"
          error={errors.phone}
          hint="Téléphone ou e-mail : au moins l’un des deux."
        >
          <input
            id={id('phone')}
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={describedBy('phone')}
            className={inputClass}
          />
        </Field>
        <Field id={id('email')} label="E-mail" optional error={errors.email}>
          <input
            id={id('email')}
            name="email"
            type="email"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={describedBy('email')}
            className={inputClass}
          />
        </Field>
      </div>
      <Field id={id('message')} label={text.message} error={errors.message}>
        <textarea
          id={id('message')}
          name="message"
          rows={5}
          required
          aria-invalid={Boolean(errors.message)}
          aria-describedby={describedBy('message')}
          className={textareaClass}
        />
      </Field>
      <p className="text-ink-soft text-sm">
        Vos coordonnées servent uniquement à vous répondre.{' '}
        <Link href="/politique-de-confidentialite" className="underline underline-offset-4">
          Politique de confidentialité
        </Link>
      </p>
      {errors.form && (
        <p role="alert" className="text-accent font-semibold">
          {errors.form}
        </p>
      )}
      <div>
        <button
          type="submit"
          disabled={pending}
          className="bg-accent text-accent-ink hover:bg-ink hover:text-cream inline-flex min-h-12 items-center rounded-full px-8 text-sm font-semibold transition active:scale-[0.98] disabled:opacity-60"
        >
          {pending ? 'Envoi…' : text.submit}
        </button>
      </div>
    </form>
  )
}
