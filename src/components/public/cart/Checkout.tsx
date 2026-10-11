'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Minus, Plus, Trash, WhatsappLogo } from '@phosphor-icons/react'
import { useState, type FormEvent } from 'react'
import type { PaymentNumber } from '@/db/schema'
import { formatAmount } from '@/lib/format'
import {
  buildOrderMessage,
  DELIVERY_LABELS,
  PAYMENT_LABELS,
  type DeliveryMode,
  type PaymentMethod,
} from '@/lib/messages'
import { normalizeCongoPhone } from '@/lib/phone'
import { buildWhatsAppUrl } from '@/lib/whatsapp'
import { antiSpamPayload, Honeypot, useStartedAt } from '../form/AntiSpamFields'
import { Field, inputClass, textareaClass } from '../form/Field'
import { PaymentDetails } from '../PaymentDetails'
import { lineKey, useCart } from './CartProvider'

interface CheckoutProps {
  organizationName: string
  whatsappNumber: string
  paymentNumbers: PaymentNumber[]
  bankDetails: string | null
}

/** Moyens de paiement proposés selon le mode de remise. */
const METHODS: Record<DeliveryMode, PaymentMethod[]> = {
  livraison: ['mobile_money', 'cash_livraison', 'virement'],
  retrait: ['mobile_money', 'sur_place', 'virement'],
}

export function Checkout({
  organizationName,
  whatsappNumber,
  paymentNumbers,
  bankDetails,
}: CheckoutProps) {
  const { lines, ready, setQuantity, remove, clear } = useCart()
  const startedAt = useStartedAt()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [pending, setPending] = useState(false)
  const [delivery, setDelivery] = useState<DeliveryMode>('livraison')
  const [payment, setPayment] = useState<PaymentMethod>('mobile_money')
  const [done, setDone] = useState<{
    url: string
    reference: string | null
    payment: PaymentMethod
  } | null>(null)

  const currency = lines[0]?.currency ?? 'CDF'
  const estimatedTotal = lines.reduce((sum, l) => sum + l.unitAmount * l.quantity, 0)

  function chooseDelivery(mode: DeliveryMode) {
    setDelivery(mode)
    if (!METHODS[mode].includes(payment)) setPayment('mobile_money')
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const payload = {
      customerName: String(form.get('customerName') ?? ''),
      customerPhone: String(form.get('customerPhone') ?? ''),
      deliveryMode: delivery,
      deliveryCommune: String(form.get('deliveryCommune') ?? ''),
      deliveryAddress: String(form.get('deliveryAddress') ?? ''),
      message: String(form.get('message') ?? ''),
      paymentMethod: payment,
      items: lines.map((l) => ({
        productId: l.productId,
        quantity: l.quantity,
        variant: l.variant,
      })),
    }
    setPending(true)
    setErrors({})

    let url: string
    let reference: string | null = null
    try {
      const response = await fetch('/api/commandes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, ...antiSpamPayload(form, startedAt) }),
      })
      const result = await response.json()
      if (!result.ok) {
        setErrors(result.errors ?? { form: 'Vérifiez le formulaire.' })
        setPending(false)
        return
      }
      url = result.whatsappUrl
      reference = result.reference
    } catch {
      // Coupure réseau : récapitulatif construit ici, la fondation confirmera le total.
      url = buildWhatsAppUrl(
        whatsappNumber,
        buildOrderMessage({
          ...payload,
          organizationName,
          reference: null,
          customerPhone: normalizeCongoPhone(payload.customerPhone) ?? payload.customerPhone,
          paymentLabel: PAYMENT_LABELS[payment],
          lines: lines.map((l) => ({
            name: l.name,
            variant: l.variant,
            quantity: l.quantity,
            unitAmount: l.unitAmount,
          })),
          totalAmount: estimatedTotal,
          currency,
        }),
      )
    }
    clear()
    setDone({ url, reference, payment })
    setPending(false)
    window.location.assign(url)
  }

  if (done) {
    const paysAhead = done.payment === 'mobile_money' || done.payment === 'virement'
    return (
      <div className="border-line grid gap-6 border p-6 md:p-10" role="status">
        <h2 className="font-display text-4xl font-medium">Merci pour votre commande</h2>
        <p className="max-w-[52ch]">
          Envoyez le message WhatsApp qui vient de s’ouvrir : l’équipe de la fondation confirme la
          disponibilité, le total et la remise de votre commande par retour de message.
        </p>
        {done.reference && (
          <p className="text-lg">
            Votre référence : <strong className="text-accent">{done.reference}</strong>
          </p>
        )}
        {paysAhead && (
          <div className="bg-cream-deep p-5">
            <p className="font-semibold">Pour payer</p>
            <PaymentDetails
              method={done.payment === 'virement' ? 'virement' : 'mobile_money'}
              paymentNumbers={paymentNumbers}
              bankDetails={bankDetails}
            />
            {done.reference && (
              <p className="mt-3 text-sm">
                Indiquez la référence <strong>{done.reference}</strong> dans le motif du paiement,
                puis envoyez la référence de la transaction sur WhatsApp.
              </p>
            )}
          </div>
        )}
        <div>
          <a
            href={done.url}
            className="bg-whatsapp inline-flex min-h-12 items-center gap-2 rounded-full px-6 text-sm font-semibold text-white dark:text-[#10261a]"
          >
            <WhatsappLogo size={18} weight="fill" aria-hidden />
            Ouvrir WhatsApp
          </a>
        </div>
      </div>
    )
  }

  if (!ready) return <div className="bg-cream-deep h-80 animate-pulse" aria-hidden />

  if (lines.length === 0) {
    return (
      <div className="border-line border p-6 md:p-10">
        <p className="font-display text-3xl">Votre panier est vide.</p>
        <Link
          href="/boutique"
          className="bg-accent text-accent-ink mt-6 inline-flex min-h-12 items-center rounded-full px-6 text-sm font-semibold"
        >
          Voir la boutique
        </Link>
      </div>
    )
  }

  const describedBy = (name: string) => (errors[name] ? `${name}-error` : undefined)
  const choice = (active: boolean) =>
    `flex min-h-12 cursor-pointer items-center gap-3 rounded-full border px-5 text-sm transition ${
      active ? 'border-ink bg-cream-deep' : 'border-ink/25'
    }`

  return (
    <div className="grid gap-14 lg:grid-cols-[1.2fr_1fr]">
      <section aria-labelledby="panier-titre">
        <h2 id="panier-titre" className="sr-only">
          Articles
        </h2>
        <ul className="divide-line border-line divide-y border-y">
          {lines.map((line) => {
            const key = lineKey(line)
            const variant = Object.values(line.variant).join(', ')
            return (
              <li key={key} className="flex gap-4 py-5">
                <div className="bg-cream-deep relative aspect-[4/5] w-20 shrink-0 overflow-hidden">
                  {line.imageUrl && (
                    <Image src={line.imageUrl} alt="" fill sizes="80px" className="object-cover" />
                  )}
                </div>
                <div className="flex min-w-0 grow flex-col">
                  <Link
                    href={`/produits/${line.slug}`}
                    className="font-display text-xl font-semibold"
                  >
                    {line.name}
                  </Link>
                  {variant && <p className="text-ink-soft text-sm">{variant}</p>}
                  <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
                    <div className="border-line flex items-center rounded-full border">
                      <button
                        type="button"
                        onClick={() => setQuantity(key, line.quantity - 1)}
                        className="flex size-11 items-center justify-center"
                        aria-label={`Diminuer la quantité de ${line.name}`}
                      >
                        <Minus size={14} aria-hidden />
                      </button>
                      <span className="w-6 text-center text-sm font-semibold">{line.quantity}</span>
                      <button
                        type="button"
                        onClick={() => setQuantity(key, line.quantity + 1)}
                        className="flex size-11 items-center justify-center"
                        aria-label={`Augmenter la quantité de ${line.name}`}
                      >
                        <Plus size={14} aria-hidden />
                      </button>
                    </div>
                    <p className="font-semibold whitespace-nowrap">
                      {formatAmount(line.unitAmount * line.quantity, line.currency)}
                    </p>
                    <button
                      type="button"
                      onClick={() => remove(key)}
                      className="text-ink-soft hover:text-accent flex size-11 items-center justify-center"
                      aria-label={`Retirer ${line.name}`}
                    >
                      <Trash size={18} aria-hidden />
                    </button>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
        <p className="mt-6 flex justify-between text-lg">
          <span>Total estimé</span>
          <strong>{formatAmount(estimatedTotal, currency)}</strong>
        </p>
        <p className="text-ink-soft mt-2 text-sm">
          Le total définitif (offres du jour, réductions par quantité, livraison) est calculé à
          l’envoi et confirmé sur WhatsApp.
        </p>
        {errors.items && (
          <p className="text-accent mt-4 font-semibold" role="alert">
            {errors.items}
          </p>
        )}
      </section>

      <form onSubmit={onSubmit} noValidate className="relative grid content-start gap-6">
        <Honeypot />
        <div className="grid gap-6 sm:grid-cols-2">
          <Field id="customerName" label="Nom complet" error={errors.customerName}>
            <input
              id="customerName"
              name="customerName"
              autoComplete="name"
              required
              aria-invalid={Boolean(errors.customerName)}
              aria-describedby={describedBy('customerName')}
              className={inputClass}
            />
          </Field>
          <Field id="customerPhone" label="Téléphone (WhatsApp)" error={errors.customerPhone}>
            <input
              id="customerPhone"
              name="customerPhone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              required
              aria-invalid={Boolean(errors.customerPhone)}
              aria-describedby={describedBy('customerPhone')}
              className={inputClass}
            />
          </Field>
        </div>

        <fieldset className="grid gap-3">
          <legend className="mb-1 text-sm font-semibold">Remise de la commande</legend>
          {(Object.keys(DELIVERY_LABELS) as DeliveryMode[]).map((mode) => (
            <label key={mode} className={choice(delivery === mode)}>
              <input
                type="radio"
                name="deliveryMode"
                value={mode}
                checked={delivery === mode}
                onChange={() => chooseDelivery(mode)}
                className="accent-[var(--accent)]"
              />
              {DELIVERY_LABELS[mode]}
            </label>
          ))}
        </fieldset>

        {delivery === 'livraison' && (
          <div className="grid gap-6 sm:grid-cols-2">
            <Field id="deliveryCommune" label="Commune" error={errors.deliveryCommune}>
              <input
                id="deliveryCommune"
                name="deliveryCommune"
                aria-invalid={Boolean(errors.deliveryCommune)}
                aria-describedby={describedBy('deliveryCommune')}
                className={inputClass}
              />
            </Field>
            <Field id="deliveryAddress" label="Adresse" optional error={errors.deliveryAddress}>
              <input
                id="deliveryAddress"
                name="deliveryAddress"
                autoComplete="street-address"
                className={inputClass}
              />
            </Field>
          </div>
        )}

        <fieldset className="grid gap-3">
          <legend className="mb-1 text-sm font-semibold">Paiement</legend>
          {METHODS[delivery].map((method) => (
            <label key={method} className={choice(payment === method)}>
              <input
                type="radio"
                name="paymentMethod"
                value={method}
                checked={payment === method}
                onChange={() => setPayment(method)}
                className="accent-[var(--accent)]"
              />
              {PAYMENT_LABELS[method]}
            </label>
          ))}
          {(payment === 'mobile_money' || payment === 'virement') && (
            <div className="bg-cream-deep mt-1 p-4 text-sm">
              <PaymentDetails
                method={payment}
                paymentNumbers={paymentNumbers}
                bankDetails={bankDetails}
              />
              <p className="text-ink-soft mt-2">
                Payez après confirmation de la commande, puis envoyez la référence de la
                transaction sur WhatsApp.
              </p>
            </div>
          )}
          {errors.paymentMethod && (
            <p className="text-accent text-sm font-semibold" role="alert">
              {errors.paymentMethod}
            </p>
          )}
        </fieldset>

        <Field id="message" label="Message" optional>
          <textarea id="message" name="message" rows={3} className={textareaClass} />
        </Field>

        <p className="text-ink-soft text-sm">
          Vos coordonnées servent uniquement à traiter la commande.{' '}
          <Link href="/politique-de-confidentialite" className="underline underline-offset-4">
            Politique de confidentialité
          </Link>
        </p>

        {errors.form && (
          <p className="text-accent font-semibold" role="alert">
            {errors.form}
          </p>
        )}

        <div>
          <button
            type="submit"
            disabled={pending}
            className="bg-accent text-accent-ink hover:bg-ink hover:text-cream inline-flex min-h-12 items-center gap-2 rounded-full px-8 text-sm font-semibold transition active:scale-[0.98] disabled:opacity-60"
          >
            <WhatsappLogo size={18} weight="fill" aria-hidden />
            {pending ? 'Envoi…' : 'Commander sur WhatsApp'}
          </button>
        </div>
      </form>
    </div>
  )
}
