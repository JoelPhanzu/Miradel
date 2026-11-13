'use client'

import { ArrowDown, ArrowUp, Plus, Trash } from '@phosphor-icons/react'
import { useState } from 'react'
import type { FormFieldDef, FormFieldType } from '@/db/schema'
import { FIELD_TYPE_LABELS, newFieldId, TYPES_WITH_OPTIONS } from '@/lib/program-forms'
import { fieldClass, useFieldError } from './form'

type Row = FormFieldDef & { optionsText: string }

const toRow = (f: FormFieldDef): Row => ({ ...f, optionsText: (f.options ?? []).join('\n') })

/**
 * Champs du formulaire de participation : question, type de réponse, obligatoire ou non,
 * choix proposés. Réordonnancement par flèches (plus fiable au doigt que le glisser-déposer).
 * Les réponses déjà reçues gardent une copie des questions : modifier un champ ne les abîme pas.
 */
export function FormFieldsBuilder({ defaultValue }: { defaultValue: FormFieldDef[] }) {
  const [rows, setRows] = useState<Row[]>(defaultValue.map(toRow))
  const error = useFieldError('fields')

  const value: FormFieldDef[] = rows.map(({ optionsText, ...f }) => ({
    ...f,
    options: TYPES_WITH_OPTIONS.includes(f.type)
      ? optionsText
          .split('\n')
          .map((o) => o.trim())
          .filter(Boolean)
      : undefined,
  }))

  const update = (i: number, patch: Partial<Row>) =>
    setRows((list) => list.map((r, j) => (j === i ? { ...r, ...patch } : r)))
  const move = (i: number, delta: number) =>
    setRows((list) => {
      const next = [...list]
      const [item] = next.splice(i, 1)
      next.splice(i + delta, 0, item)
      return next
    })

  return (
    <div className="grid gap-4">
      <input type="hidden" name="fields" value={JSON.stringify(value)} />
      {rows.length === 0 && (
        <p className="text-ink-soft text-sm">Aucun champ : ajoutez au moins une question.</p>
      )}
      <ol className="grid gap-4">
        {rows.map((row, i) => (
          <li key={row.id} className="border-line grid gap-4 rounded-2xl border p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-ink-soft text-sm font-semibold">Champ n° {i + 1}</span>
              <div className="flex">
                <button
                  type="button"
                  disabled={i === 0}
                  onClick={() => move(i, -1)}
                  className="flex size-11 items-center justify-center disabled:opacity-30"
                  aria-label={`Monter le champ ${i + 1}`}
                >
                  <ArrowUp size={18} aria-hidden />
                </button>
                <button
                  type="button"
                  disabled={i === rows.length - 1}
                  onClick={() => move(i, 1)}
                  className="flex size-11 items-center justify-center disabled:opacity-30"
                  aria-label={`Descendre le champ ${i + 1}`}
                >
                  <ArrowDown size={18} aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => setRows((list) => list.filter((_, j) => j !== i))}
                  className="text-accent flex size-11 items-center justify-center"
                  aria-label={`Retirer le champ ${i + 1}`}
                >
                  <Trash size={18} aria-hidden />
                </button>
              </div>
            </div>
            <label className="grid gap-1 text-sm font-semibold">
              Question
              <input
                value={row.label}
                placeholder="Ex. Quel métier souhaitez-vous apprendre ?"
                onChange={(e) => update(i, { label: e.target.value })}
                className={fieldClass}
              />
            </label>
            <label className="grid gap-1 text-sm font-semibold">
              Type de réponse
              <select
                value={row.type}
                onChange={(e) => {
                  const type = e.target.value as FormFieldType
                  update(i, { type, required: type === 'consent' ? true : row.required })
                }}
                className={fieldClass}
              >
                {(Object.keys(FIELD_TYPE_LABELS) as FormFieldType[]).map((t) => (
                  <option key={t} value={t}>
                    {FIELD_TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
            </label>
            {TYPES_WITH_OPTIONS.includes(row.type) && (
              <label className="grid gap-1 text-sm font-semibold">
                Choix proposés (un par ligne)
                <textarea
                  rows={4}
                  value={row.optionsText}
                  placeholder={'Couture\nCoiffure\nAgriculture'}
                  onChange={(e) => update(i, { optionsText: e.target.value })}
                  className={`${fieldClass} py-3`}
                />
              </label>
            )}
            <label className="grid gap-1 text-sm font-semibold">
              Aide (facultatif)
              <input
                value={row.help ?? ''}
                placeholder="Précision affichée sous la question"
                onChange={(e) => update(i, { help: e.target.value })}
                className={fieldClass}
              />
            </label>
            {row.type !== 'consent' && (
              <label className="flex min-h-11 items-center gap-3 text-sm font-semibold">
                <input
                  type="checkbox"
                  checked={row.required}
                  onChange={(e) => update(i, { required: e.target.checked })}
                  className="accent-accent size-5"
                />
                Réponse obligatoire
              </label>
            )}
          </li>
        ))}
      </ol>
      <button
        type="button"
        onClick={() =>
          setRows((list) => [
            ...list,
            { id: newFieldId(), label: '', type: 'text', required: false, optionsText: '' },
          ])
        }
        className="border-ink/40 inline-flex min-h-12 w-fit items-center gap-2 rounded-full border px-5 text-sm font-semibold"
      >
        <Plus size={18} aria-hidden />
        Ajouter un champ
      </button>
      {error && <p className="text-accent text-sm font-semibold">{error}</p>}
    </div>
  )
}
