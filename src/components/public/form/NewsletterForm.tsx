'use client'

import Link from 'next/link'
import { useState, type FormEvent } from 'react'
import { antiSpamPayload, Honeypot, useStartedAt } from './AntiSpamFields'
import { inputClass } from './Field'

/** Inscription à la lettre d'information (consentement explicite, enregistrée en base). */
export function NewsletterForm() {
  const startedAt = useStartedAt()
  const [state, setState] = useState<'idle' | 'pending' | 'done'>('idle')
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setState('pending')
    setError(null)
    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: String(form.get('email') ?? ''),
          consent: form.get('consent') === 'on',
          ...antiSpamPayload(form, startedAt),
        }),
      })
      const result = await response.json()
      if (!result.ok) {
        setError(Object.values(result.errors ?? {})[0] as string)
        setState('idle')
        return
      }
      setState('done')
    } catch {
      setError('Connexion perdue. Réessayez.')
      setState('idle')
    }
  }

  if (state === 'done') {
    return (
      <p role="status" className="font-semibold">
        Merci ! Vous recevrez nos nouvelles.
      </p>
    )
  }

  return (
    <form onSubmit={onSubmit} noValidate className="relative grid gap-3">
      <Honeypot />
      <label htmlFor="newsletter-email" className="text-sm font-semibold">
        Recevoir nos nouvelles
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id="newsletter-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="votre@adresse.com"
          className={inputClass}
        />
        <button
          type="submit"
          disabled={state === 'pending'}
          className="bg-ink text-cream min-h-12 shrink-0 rounded-full px-6 text-sm font-semibold disabled:opacity-60"
        >
          {state === 'pending' ? 'Envoi…' : 'S’inscrire'}
        </button>
      </div>
      <label className="text-ink-soft flex items-start gap-2 text-xs">
        <input type="checkbox" name="consent" className="mt-0.5 size-4 accent-[var(--accent)]" />
        <span>
          J’accepte de recevoir les nouvelles de la fondation par e-mail. Désinscription à tout
          moment.{' '}
          <Link href="/politique-de-confidentialite" className="underline underline-offset-2">
            Confidentialité
          </Link>
        </span>
      </label>
      {error && (
        <p role="alert" className="text-accent text-sm font-semibold">
          {error}
        </p>
      )}
    </form>
  )
}
