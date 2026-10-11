'use client'

import { useSearchParams } from 'next/navigation'
import { WhatsappLogo } from '@phosphor-icons/react'
import { useState, type FormEvent } from 'react'
import type { SuggestedAmount } from '@/db/schema'
import { formatAmount } from '@/lib/format'
import { buildDonationMessage, DONATION_METHOD_LABELS, type DonationMethod } from '@/lib/messages'
import type { Currency } from '@/lib/pricing/types'
import { buildWhatsAppUrl } from '@/lib/whatsapp'
import { antiSpamPayload, Honeypot, useStartedAt } from './AntiSpamFields'
import { Field, inputClass, textareaClass } from './Field'

interface DonationFormProps {
  organizationName: string
  whatsappNumber: string
  suggestedAmounts: SuggestedAmount[]
  programs: { slug: string; title: string }[]
}

/** « 12,50 » USD -> 1250 cents ; « 10 000 » FC -> 10000. null si invalide. */
function toStoredAmount(raw: string, currency: Currency): number | null {
  const value = Number(raw.replace(/[\s  ]/g, '').replace(',', '.'))
  if (!Number.isFinite(value) || value <= 0) return null
  return currency === 'USD' ? Math.round(value * 100) : Math.round(value)
}

const shown = (amount: number, currency: Currency) =>
  currency === 'USD' ? (amount / 100).toFixed(2).replace('.', ',') : String(amount)

/** Déclaration de don : enregistrée pour que l'équipe confirme la réception des fonds. */
export function DonationForm({
  organizationName,
  whatsappNumber,
  suggestedAmounts,
  programs,
}: DonationFormProps) {
  const searchParams = useSearchParams()
  const startedAt = useStartedAt()
  const [currency, setCurrency] = useState<Currency>('CDF')
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState<DonationMethod>('mobile_money')
  const [anonymous, setAnonymous] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [pending, setPending] = useState(false)
  const [done, setDone] = useState<{ reference: string | null; url: string } | null>(null)

  const suggestions = suggestedAmounts.filter((a) => a.currency === currency)
  const defaultProgram = programs.some((p) => p.slug === searchParams.get('programme'))
    ? searchParams.get('programme')!
    : ''

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const stored = toStoredAmount(amount, currency)
    if (stored === null) {
      setErrors({ amount: 'Indiquez le montant du don' })
      return
    }
    const payload = {
      isAnonymous: anonymous,
      donorName: anonymous ? '' : String(form.get('donorName') ?? ''),
      donorPhone: String(form.get('donorPhone') ?? ''),
      donorEmail: String(form.get('donorEmail') ?? ''),
      amount: stored,
      currency,
      paymentMethod: method,
      transactionReference: String(form.get('transactionReference') ?? ''),
      programSlug: String(form.get('programSlug') ?? ''),
      message: String(form.get('message') ?? ''),
    }
    setPending(true)
    setErrors({})
    try {
      const response = await fetch('/api/dons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, ...antiSpamPayload(form, startedAt) }),
      })
      const result = await response.json()
      if (!result.ok) {
        setErrors(result.errors ?? { form: 'Vérifiez le formulaire.' })
        return
      }
      setDone({ reference: result.reference, url: result.whatsappUrl })
    } catch {
      // Coupure réseau : la déclaration se fait par WhatsApp, rien n'est perdu.
      setDone({
        reference: null,
        url: buildWhatsAppUrl(
          whatsappNumber,
          buildDonationMessage({
            organizationName,
            reference: null,
            donorName: payload.isAnonymous ? null : payload.donorName,
            amount: stored,
            currency,
            methodLabel: DONATION_METHOD_LABELS[method],
            transactionReference: payload.transactionReference,
            programTitle: programs.find((p) => p.slug === payload.programSlug)?.title,
          }),
        ),
      })
    } finally {
      setPending(false)
    }
  }

  if (done) {
    return (
      <div role="status" className="bg-accent-soft grid gap-5 p-6 md:p-10">
        <h2 className="font-display text-4xl font-medium">Merci pour votre générosité</h2>
        <p className="max-w-[52ch]">
          {done.reference
            ? 'Votre déclaration de don est enregistrée. L’équipe de la fondation vérifie la réception des fonds et vous confirme votre don.'
            : 'La connexion a été interrompue : envoyez votre déclaration par WhatsApp pour que l’équipe confirme votre don.'}
        </p>
        {done.reference && (
          <p className="text-lg">
            Votre référence : <strong className="text-accent">{done.reference}</strong>
          </p>
        )}
        <div>
          <a
            href={done.url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-whatsapp inline-flex min-h-12 items-center gap-2 rounded-full px-6 text-sm font-semibold text-white dark:text-[#10261a]"
          >
            <WhatsappLogo size={18} weight="fill" aria-hidden />
            Prévenir la fondation sur WhatsApp
          </a>
        </div>
      </div>
    )
  }

  const describedBy = (name: string) => (errors[name] ? `don-${name}-error` : undefined)
  const choice = (active: boolean) =>
    `flex min-h-12 cursor-pointer items-center gap-3 rounded-full border px-5 text-sm transition ${
      active ? 'border-ink bg-cream-deep' : 'border-ink/25'
    }`

  return (
    <form onSubmit={onSubmit} noValidate className="relative grid gap-7">
      <Honeypot />

      <fieldset className="grid gap-3">
        <legend className="mb-1 text-sm font-semibold">Montant du don</legend>
        <div className="flex gap-2" role="group" aria-label="Devise">
          {(['CDF', 'USD'] as const).map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={currency === c}
              onClick={() => {
                setCurrency(c)
                setAmount('')
              }}
              className={`min-h-11 rounded-full border px-5 text-sm font-semibold ${
                currency === c ? 'bg-ink text-cream border-ink' : 'border-line'
              }`}
            >
              {c === 'CDF' ? 'Francs congolais (FC)' : 'Dollars (USD)'}
            </button>
          ))}
        </div>
        {suggestions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s.amount}
                type="button"
                aria-pressed={amount === shown(s.amount, currency)}
                onClick={() => setAmount(shown(s.amount, currency))}
                className={`min-h-11 rounded-full border px-5 text-sm font-semibold ${
                  amount === shown(s.amount, currency)
                    ? 'bg-accent text-accent-ink border-accent'
                    : 'border-line hover:border-ink'
                }`}
              >
                {formatAmount(s.amount, currency)}
              </button>
            ))}
          </div>
        )}
        <Field id="don-amount" label={`Montant (${currency === 'USD' ? 'USD' : 'FC'})`} error={errors.amount}>
          <input
            id="don-amount"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={currency === 'USD' ? 'Ex. 25' : 'Ex. 10 000'}
            aria-invalid={Boolean(errors.amount)}
            aria-describedby={describedBy('amount')}
            className={inputClass}
          />
        </Field>
      </fieldset>

      <fieldset className="grid gap-3">
        <legend className="mb-1 text-sm font-semibold">Moyen utilisé</legend>
        {(Object.keys(DONATION_METHOD_LABELS) as DonationMethod[]).map((m) => (
          <label key={m} className={choice(method === m)}>
            <input
              type="radio"
              name="paymentMethod"
              checked={method === m}
              onChange={() => setMethod(m)}
              className="accent-[var(--accent)]"
            />
            {DONATION_METHOD_LABELS[m]}
          </label>
        ))}
      </fieldset>

      {method !== 'especes' && (
        <Field
          id="don-transactionReference"
          label="Référence de la transaction"
          optional
          hint="Indiquée dans le SMS de confirmation mobile money ou sur l’avis de virement."
        >
          <input
            id="don-transactionReference"
            name="transactionReference"
            className={inputClass}
          />
        </Field>
      )}

      {programs.length > 0 && (
        <Field id="don-program" label="Programme soutenu" optional>
          <select
            id="don-program"
            name="programSlug"
            defaultValue={defaultProgram}
            className={inputClass}
          >
            <option value="">Là où le besoin est le plus grand</option>
            {programs.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.title}
              </option>
            ))}
          </select>
        </Field>
      )}

      <label className="flex min-h-11 items-center gap-3 text-sm font-semibold">
        <input
          type="checkbox"
          checked={anonymous}
          onChange={(e) => setAnonymous(e.target.checked)}
          className="size-5 accent-[var(--accent)]"
        />
        Don anonyme (votre nom ne sera pas affiché)
      </label>

      <div className="grid gap-6 sm:grid-cols-2">
        {!anonymous && (
          <Field id="don-donorName" label="Nom" error={errors.donorName}>
            <input
              id="don-donorName"
              name="donorName"
              autoComplete="name"
              aria-invalid={Boolean(errors.donorName)}
              aria-describedby={describedBy('donorName')}
              className={inputClass}
            />
          </Field>
        )}
        <Field
          id="don-donorPhone"
          label="Téléphone (WhatsApp)"
          error={errors.donorPhone}
          hint="Pour vous confirmer la réception du don."
        >
          <input
            id="don-donorPhone"
            name="donorPhone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            aria-invalid={Boolean(errors.donorPhone)}
            aria-describedby={describedBy('donorPhone')}
            className={inputClass}
          />
        </Field>
        <Field id="don-donorEmail" label="E-mail" optional error={errors.donorEmail}>
          <input
            id="don-donorEmail"
            name="donorEmail"
            type="email"
            autoComplete="email"
            aria-invalid={Boolean(errors.donorEmail)}
            aria-describedby={describedBy('donorEmail')}
            className={inputClass}
          />
        </Field>
      </div>

      <Field id="don-message" label="Message" optional>
        <textarea id="don-message" name="message" rows={3} className={textareaClass} />
      </Field>

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
          {pending ? 'Envoi…' : 'Déclarer mon don'}
        </button>
      </div>
    </form>
  )
}
