'use client'

import { Plus, Trash } from '@phosphor-icons/react'
import { useState } from 'react'
import type { PaymentNumber } from '@/db/schema'
import { fieldClass, useFieldError } from './form'

const PROVIDERS = ['M-Pesa', 'Orange Money', 'Airtel Money', 'Afrimoney']

/** Numéros mobile money affichés lors d'une commande ou d'un don. */
export function PaymentNumbersField({ defaultValue }: { defaultValue: PaymentNumber[] }) {
  const error = useFieldError('paymentNumbers')
  const [rows, setRows] = useState<PaymentNumber[]>(defaultValue)
  const update = (i: number, patch: Partial<PaymentNumber>) =>
    setRows((list) => list.map((r, j) => (j === i ? { ...r, ...patch } : r)))

  return (
    <div className="grid gap-3">
      <input type="hidden" name="paymentNumbers" value={JSON.stringify(rows)} />
      {rows.length === 0 && (
        <p className="text-ink-soft text-sm">
          Aucun numéro enregistré : le client verra « La fondation vous communique le numéro
          sur WhatsApp ».
        </p>
      )}
      {rows.map((row, i) => (
        <div key={i} className="border-line grid gap-3 rounded-2xl border p-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1 text-sm font-semibold">
              Opérateur
              <input
                list="mobile-money-providers"
                value={row.provider}
                onChange={(e) => update(i, { provider: e.target.value })}
                className={fieldClass}
              />
            </label>
            <label className="grid gap-1 text-sm font-semibold">
              Numéro
              <input
                inputMode="tel"
                value={row.number}
                onChange={(e) => update(i, { number: e.target.value })}
                className={fieldClass}
              />
            </label>
          </div>
          <label className="grid gap-1 text-sm font-semibold">
            Nom du titulaire (affiché au client)
            <input
              value={row.holder}
              onChange={(e) => update(i, { holder: e.target.value })}
              className={fieldClass}
            />
          </label>
          <button
            type="button"
            onClick={() => setRows((list) => list.filter((_, j) => j !== i))}
            className="text-accent inline-flex min-h-11 w-fit items-center gap-2 text-sm font-semibold"
          >
            <Trash size={16} aria-hidden />
            Retirer ce numéro
          </button>
        </div>
      ))}
      <datalist id="mobile-money-providers">
        {PROVIDERS.map((p) => (
          <option key={p} value={p} />
        ))}
      </datalist>
      <button
        type="button"
        onClick={() => setRows((list) => [...list, { provider: '', number: '', holder: '' }])}
        className="border-ink/40 inline-flex min-h-12 w-fit items-center gap-2 rounded-full border px-5 text-sm font-semibold"
      >
        <Plus size={18} aria-hidden />
        Ajouter un numéro
      </button>
      {error && <p className="text-accent text-sm font-semibold">{error}</p>}
    </div>
  )
}
