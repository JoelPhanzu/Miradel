'use client'

import { Plus, Trash } from '@phosphor-icons/react'
import { useState } from 'react'
import type { ProductVariants } from '@/db/schema'
import { fieldClass } from './form'

/**
 * Variantes simples : un nom (« Contenance ») et ses choix séparés par des points-virgules
 * (« 1 L; 2,5 L; 5 L ») — la virgule sert aux décimales. Le prix est le même pour tous les choix.
 */
export function VariantsField({ defaultValue }: { defaultValue: ProductVariants }) {
  const [rows, setRows] = useState(
    Object.entries(defaultValue).map(([name, values]) => ({ name, values: values.join('; ') })),
  )
  const value: ProductVariants = Object.fromEntries(
    rows
      .map((r) => [
        r.name.trim().toLowerCase(),
        r.values
          .split(';')
          .map((v) => v.trim())
          .filter(Boolean),
      ])
      .filter(([name, values]) => name && values.length > 0),
  )

  return (
    <div className="grid gap-3">
      <span className="text-sm font-semibold">Variantes</span>
      <input type="hidden" name="variants" value={JSON.stringify(value)} />
      {rows.length === 0 && (
        <p className="text-ink-soft text-sm">Aucune variante : le produit se commande tel quel.</p>
      )}
      {rows.map((row, i) => (
        <div
          key={i}
          className="border-line grid gap-3 rounded-2xl border p-3 sm:grid-cols-[1fr_2fr_auto] sm:items-end"
        >
          <label className="grid gap-1 text-sm font-semibold">
            Nom
            <input
              value={row.name}
              placeholder="Contenance"
              onChange={(e) =>
                setRows((l) => l.map((r, j) => (j === i ? { ...r, name: e.target.value } : r)))
              }
              className={fieldClass}
            />
          </label>
          <label className="grid gap-1 text-sm font-semibold">
            Choix (séparés par des points-virgules)
            <input
              value={row.values}
              placeholder="1 L; 2,5 L; 5 L"
              onChange={(e) =>
                setRows((l) => l.map((r, j) => (j === i ? { ...r, values: e.target.value } : r)))
              }
              className={fieldClass}
            />
          </label>
          <button
            type="button"
            onClick={() => setRows((l) => l.filter((_, j) => j !== i))}
            className="text-accent flex size-12 items-center justify-center"
            aria-label="Retirer cette variante"
          >
            <Trash size={18} aria-hidden />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => setRows((l) => [...l, { name: '', values: '' }])}
        className="border-ink/40 inline-flex min-h-12 w-fit items-center gap-2 rounded-full border px-5 text-sm font-semibold"
      >
        <Plus size={18} aria-hidden />
        Ajouter une variante
      </button>
    </div>
  )
}
