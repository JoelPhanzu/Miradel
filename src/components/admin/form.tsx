'use client'

/**
 * Formulaires de l'admin : une colonne, gros boutons, vocabulaire du métier.
 * La saisie n'est jamais perdue : en cas d'échec réseau, le formulaire reste rempli.
 */
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  ArrowDown,
  ArrowUp,
  CheckCircle,
  ImageSquare,
  Plus,
  Trash,
  WarningCircle,
  X,
} from '@phosphor-icons/react'
import {
  createContext,
  use,
  useId,
  useState,
  useTransition,
  type FormEvent,
  type ReactNode,
} from 'react'
import { uploadImage } from '@/lib/admin/compress-image'
import type { ActionState } from '@/lib/admin/types'

const ErrorsContext = createContext<Record<string, string>>({})

/** Erreur renvoyée par le serveur pour un champ (composants de champ sur mesure). */
export function useFieldError(name: string): string | undefined {
  return use(ErrorsContext)[name]
}

export const fieldClass =
  'border-ink/25 bg-cream text-ink focus:border-ink min-h-12 w-full rounded-2xl border px-4 text-base outline-none transition aria-[invalid=true]:border-accent'

type Action = (state: ActionState, formData: FormData) => Promise<ActionState>

interface AdminFormProps {
  action: Action
  children: ReactNode
  submitLabel?: string
  /** Après une création : redirige vers `${redirectBase}/${id}`. */
  redirectBase?: string
  className?: string
}

export function AdminForm({
  action,
  children,
  submitLabel = 'Enregistrer',
  redirectBase,
  className = '',
}: AdminFormProps) {
  const router = useRouter()
  const [state, setState] = useState<ActionState | null>(null)
  const [pending, startTransition] = useTransition()

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    // Une photo encore en cours d'envoi serait perdue : on attend.
    if (event.currentTarget.querySelector('[data-uploading="true"]')) {
      setState({ ok: false, message: 'Patientez : une photo est encore en cours d’envoi.' })
      return
    }
    const formData = new FormData(event.currentTarget)
    startTransition(async () => {
      try {
        const result = await action(state ?? { ok: false }, formData)
        setState(result)
        if (result.ok && result.id && redirectBase) router.push(`${redirectBase}/${result.id}`)
        else if (result.ok) router.refresh()
      } catch {
        setState({
          ok: false,
          message:
            'Connexion perdue. Votre saisie est conservée : appuyez à nouveau sur Enregistrer.',
        })
      }
    })
  }

  return (
    <ErrorsContext value={state?.errors ?? {}}>
      <form onSubmit={onSubmit} noValidate className={`grid gap-6 pb-6 ${className}`}>
        {children}
        <div className="border-line bg-cream/95 fixed inset-x-0 bottom-[68px] z-20 border-t px-4 py-3 backdrop-blur md:bottom-0 md:left-64">
          <div className="mx-auto flex max-w-3xl items-center gap-4">
            <button
              type="submit"
              disabled={pending}
              className="bg-accent text-accent-ink min-h-12 shrink-0 rounded-full px-8 text-base font-semibold transition active:scale-[0.98] disabled:opacity-60"
            >
              {pending ? 'Enregistrement…' : submitLabel}
            </button>
            {state?.message && !pending && (
              <p
                role="status"
                className={`flex items-center gap-2 text-sm font-semibold ${state.ok ? 'text-whatsapp' : 'text-accent'}`}
              >
                {state.ok ? (
                  <CheckCircle size={20} weight="fill" aria-hidden />
                ) : (
                  <WarningCircle size={20} weight="fill" aria-hidden />
                )}
                {state.message}
              </p>
            )}
          </div>
        </div>
      </form>
    </ErrorsContext>
  )
}

// --- Champs ------------------------------------------------------------------

interface FieldShellProps {
  name: string
  label: string
  hint?: string
  children: (props: { id: string; invalid: boolean; describedBy?: string }) => ReactNode
}

function FieldShell({ name, label, hint, children }: FieldShellProps) {
  const id = useId()
  const error = use(ErrorsContext)[name]
  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
      </label>
      {children({
        id,
        invalid: Boolean(error),
        describedBy: error ? `${id}-error` : hint ? `${id}-hint` : undefined,
      })}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-ink-soft text-sm">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-accent text-sm font-semibold">
          {error}
        </p>
      )}
    </div>
  )
}

interface TextFieldProps {
  name: string
  label: string
  defaultValue?: string | number | null
  hint?: string
  type?: 'text' | 'email' | 'tel' | 'url' | 'password' | 'date' | 'datetime-local' | 'number'
  required?: boolean
  placeholder?: string
  inputMode?: 'numeric' | 'tel' | 'email' | 'url' | 'text'
  autoComplete?: string
}

export function TextField({
  name,
  label,
  defaultValue,
  hint,
  type = 'text',
  ...rest
}: TextFieldProps) {
  return (
    <FieldShell name={name} label={label} hint={hint}>
      {({ id, invalid, describedBy }) => (
        <input
          id={id}
          name={name}
          type={type}
          defaultValue={defaultValue ?? ''}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          className={fieldClass}
          {...rest}
        />
      )}
    </FieldShell>
  )
}

/**
 * Montant : accepte « 50 000 » ou « 50000 » (FC), « 12,50 » (USD).
 * Sans `currency`, aucune devise n'est affichée (elle est choisie dans un autre champ).
 */
export function PriceField({
  name,
  label,
  defaultValue,
  hint,
  currency,
  storedCurrency = 'CDF',
}: {
  name: string
  label: string
  /** Montant stocké : FC, ou cents pour l'USD. */
  defaultValue?: number | null
  hint?: string
  currency?: 'CDF' | 'USD'
  storedCurrency?: 'CDF' | 'USD'
}) {
  const shown =
    defaultValue == null
      ? ''
      : storedCurrency === 'USD'
        ? (defaultValue / 100).toLocaleString('fr-FR', { minimumFractionDigits: 2 })
        : defaultValue.toLocaleString('fr-FR')
  return (
    <FieldShell name={name} label={label} hint={hint}>
      {({ id, invalid, describedBy }) => (
        <div className="relative">
          <input
            id={id}
            name={name}
            inputMode="decimal"
            defaultValue={shown}
            aria-invalid={invalid}
            aria-describedby={describedBy}
            className={`${fieldClass} ${currency ? 'pr-16' : ''}`}
          />
          {currency && (
            <span className="text-ink-soft pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-sm font-semibold">
              {currency === 'USD' ? 'USD' : 'FC'}
            </span>
          )}
        </div>
      )}
    </FieldShell>
  )
}

export function TextAreaField({
  name,
  label,
  defaultValue,
  hint,
  rows = 4,
}: {
  name: string
  label: string
  defaultValue?: string | null
  hint?: string
  rows?: number
}) {
  return (
    <FieldShell name={name} label={label} hint={hint}>
      {({ id, invalid, describedBy }) => (
        <textarea
          id={id}
          name={name}
          rows={rows}
          defaultValue={defaultValue ?? ''}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          className={`${fieldClass} py-3 leading-relaxed`}
        />
      )}
    </FieldShell>
  )
}

export function SelectField({
  name,
  label,
  defaultValue,
  options,
  hint,
  emptyLabel,
}: {
  name: string
  label: string
  defaultValue?: string | null
  options: { value: string; label: string }[]
  hint?: string
  emptyLabel?: string
}) {
  return (
    <FieldShell name={name} label={label} hint={hint}>
      {({ id, invalid, describedBy }) => (
        <select
          id={id}
          name={name}
          defaultValue={defaultValue ?? ''}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          className={fieldClass}
        >
          {emptyLabel !== undefined && <option value="">{emptyLabel}</option>}
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      )}
    </FieldShell>
  )
}

/** Interrupteur « oui / non » avec explication. */
export function ToggleField({
  name,
  label,
  description,
  defaultChecked,
}: {
  name: string
  label: string
  description?: string
  defaultChecked?: boolean
}) {
  const id = useId()
  const error = use(ErrorsContext)[name]
  return (
    <div>
      <label
        htmlFor={id}
        className="border-line has-[:checked]:border-ink flex min-h-14 cursor-pointer items-center justify-between gap-4 rounded-2xl border px-4 py-3"
      >
        <span>
          <span className="block font-semibold">{label}</span>
          {description && <span className="text-ink-soft block text-sm">{description}</span>}
        </span>
        <input
          id={id}
          name={name}
          type="checkbox"
          defaultChecked={defaultChecked}
          className="peer sr-only"
        />
        <span
          aria-hidden
          className="bg-ink/20 peer-checked:bg-whatsapp peer-focus-visible:outline-accent relative h-7 w-12 shrink-0 rounded-full transition peer-focus-visible:outline-2 after:absolute after:top-1 after:left-1 after:size-5 after:rounded-full after:bg-white after:transition peer-checked:after:translate-x-5"
        />
      </label>
      {error && <p className="text-accent mt-2 text-sm font-semibold">{error}</p>}
    </div>
  )
}

export function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="border-line grid gap-5 rounded-3xl border p-4 md:p-6">
      <legend className="font-display px-2 text-2xl font-semibold">{title}</legend>
      {children}
    </fieldset>
  )
}

// --- Images ------------------------------------------------------------------

function useUpload() {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  async function upload(files: FileList | null): Promise<string[]> {
    if (!files?.length) return []
    setBusy(true)
    setError(null)
    const urls: string[] = []
    try {
      for (const file of Array.from(files)) urls.push(await uploadImage(file))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Envoi impossible. Vérifiez la connexion.')
    } finally {
      setBusy(false)
    }
    return urls
  }
  return { busy, error, upload }
}

/** Une image : aperçu, remplacement, retrait. La valeur (URL) part dans un champ caché. */
export function ImageField({
  name,
  label,
  defaultValue,
  hint,
  aspect = 'aspect-[4/5]',
}: {
  name: string
  label: string
  defaultValue?: string | null
  hint?: string
  aspect?: string
}) {
  const id = useId()
  const [url, setUrl] = useState(defaultValue ?? '')
  const { busy, error, upload } = useUpload()
  const fieldError = use(ErrorsContext)[name]

  return (
    <div className="grid gap-2" data-uploading={busy}>
      <span className="text-sm font-semibold">{label}</span>
      <input type="hidden" name={name} value={url} />
      <div className="flex items-end gap-4">
        <div
          className={`bg-cream-deep relative w-32 shrink-0 overflow-hidden rounded-2xl ${aspect}`}
        >
          {url ? (
            <Image src={url} alt="" fill sizes="128px" className="object-cover" />
          ) : (
            <ImageSquare size={32} className="text-ink-soft absolute inset-0 m-auto" aria-hidden />
          )}
        </div>
        <div className="grid gap-2">
          <label
            htmlFor={id}
            className="border-ink/40 inline-flex min-h-12 cursor-pointer items-center justify-center rounded-full border px-5 text-sm font-semibold"
          >
            {busy ? 'Envoi…' : url ? 'Changer la photo' : 'Choisir une photo'}
          </label>
          <input
            id={id}
            type="file"
            accept="image/*"
            className="sr-only"
            disabled={busy}
            onChange={async (e) => {
              const [first] = await upload(e.target.files)
              if (first) setUrl(first)
              e.target.value = ''
            }}
          />
          {url && (
            <button
              type="button"
              onClick={() => setUrl('')}
              className="text-ink-soft min-h-11 text-sm underline underline-offset-4"
            >
              Retirer la photo
            </button>
          )}
        </div>
      </div>
      {hint && <p className="text-ink-soft text-sm">{hint}</p>}
      {(error || fieldError) && (
        <p className="text-accent text-sm font-semibold">{error ?? fieldError}</p>
      )}
    </div>
  )
}

/** Plusieurs images ordonnées (la première est l'image principale). */
export function ImagesField({
  name,
  label,
  defaultValue = [],
  hint,
}: {
  name: string
  label: string
  defaultValue?: string[]
  hint?: string
}) {
  const id = useId()
  const [urls, setUrls] = useState<string[]>(defaultValue)
  const { busy, error, upload } = useUpload()

  const move = (index: number, delta: number) =>
    setUrls((list) => {
      const next = [...list]
      const [item] = next.splice(index, 1)
      next.splice(index + delta, 0, item)
      return next
    })

  return (
    <div className="grid gap-3" data-uploading={busy}>
      <span className="text-sm font-semibold">{label}</span>
      <input type="hidden" name={name} value={JSON.stringify(urls)} />
      {urls.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {urls.map((url, i) => (
            <li key={url} className="border-line overflow-hidden rounded-2xl border">
              <div className="relative aspect-square">
                <Image src={url} alt="" fill sizes="200px" className="object-cover" />
                {i === 0 && (
                  <span className="bg-ink/80 text-cream absolute top-2 left-2 rounded-full px-2 py-0.5 text-xs font-semibold">
                    Principale
                  </span>
                )}
              </div>
              <div className="flex justify-between">
                <button
                  type="button"
                  disabled={i === 0}
                  onClick={() => move(i, -1)}
                  className="flex size-11 items-center justify-center disabled:opacity-30"
                  aria-label="Avancer"
                >
                  <ArrowUp size={18} aria-hidden />
                </button>
                <button
                  type="button"
                  disabled={i === urls.length - 1}
                  onClick={() => move(i, 1)}
                  className="flex size-11 items-center justify-center disabled:opacity-30"
                  aria-label="Reculer"
                >
                  <ArrowDown size={18} aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => setUrls((list) => list.filter((u) => u !== url))}
                  className="text-accent flex size-11 items-center justify-center"
                  aria-label="Retirer cette photo"
                >
                  <X size={18} aria-hidden />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <label
        htmlFor={id}
        className="border-ink/40 inline-flex min-h-12 w-fit cursor-pointer items-center gap-2 rounded-full border px-5 text-sm font-semibold"
      >
        <Plus size={18} aria-hidden />
        {busy ? 'Envoi…' : 'Ajouter des photos'}
      </label>
      <input
        id={id}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        disabled={busy}
        onChange={async (e) => {
          const added = await upload(e.target.files)
          if (added.length) setUrls((list) => [...list, ...added])
          e.target.value = ''
        }}
      />
      {hint && <p className="text-ink-soft text-sm">{hint}</p>}
      {error && <p className="text-accent text-sm font-semibold">{error}</p>}
    </div>
  )
}

// --- Listes simples (variantes, e-mails…) -------------------------------------

/** Liste de textes courts, une valeur par ligne de saisie. */
export function ListField({
  name,
  label,
  defaultValue = [],
  hint,
  addLabel = 'Ajouter',
  placeholder,
}: {
  name: string
  label: string
  defaultValue?: string[]
  hint?: string
  addLabel?: string
  placeholder?: string
}) {
  const [items, setItems] = useState<string[]>(defaultValue.length ? defaultValue : [''])
  const error = use(ErrorsContext)[name]
  return (
    <div className="grid gap-2">
      <span className="text-sm font-semibold">{label}</span>
      <input
        type="hidden"
        name={name}
        value={JSON.stringify(items.map((i) => i.trim()).filter(Boolean))}
      />
      {items.map((item, i) => (
        <div key={i} className="flex gap-2">
          <input
            value={item}
            placeholder={placeholder}
            aria-label={`${label} ${i + 1}`}
            onChange={(e) => setItems((list) => list.map((v, j) => (j === i ? e.target.value : v)))}
            className={fieldClass}
          />
          <button
            type="button"
            onClick={() => setItems((list) => list.filter((_, j) => j !== i))}
            className="text-ink-soft flex size-12 shrink-0 items-center justify-center"
            aria-label="Retirer"
          >
            <Trash size={18} aria-hidden />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => setItems((list) => [...list, ''])}
        className="text-accent inline-flex min-h-11 w-fit items-center gap-2 text-sm font-semibold"
      >
        <Plus size={16} aria-hidden />
        {addLabel}
      </button>
      {hint && !error && <p className="text-ink-soft text-sm">{hint}</p>}
      {error && <p className="text-accent text-sm font-semibold">{error}</p>}
    </div>
  )
}

// --- Suppression confirmée ----------------------------------------------------

/** Suppression en deux temps. Préférer « Masquer » quand c'est possible. */
export function DeleteButton({
  action,
  label = 'Supprimer',
  confirmLabel = 'Oui, supprimer définitivement',
  redirectTo,
}: {
  action: () => Promise<ActionState>
  label?: string
  confirmLabel?: string
  redirectTo: string
}) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="text-accent inline-flex min-h-11 items-center gap-2 text-sm font-semibold"
      >
        <Trash size={18} aria-hidden />
        {label}
      </button>
    )
  }

  return (
    <div className="border-accent bg-accent-soft grid gap-3 rounded-2xl border p-4">
      <p className="text-sm font-semibold">Cette suppression est définitive. Continuer ?</p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              try {
                const result = await action()
                if (result.ok) router.push(redirectTo)
                else setError(result.message ?? 'Suppression impossible')
              } catch {
                setError('Connexion perdue. Réessayez.')
              }
            })
          }
          className="bg-accent text-accent-ink min-h-11 rounded-full px-5 text-sm font-semibold"
        >
          {pending ? 'Suppression…' : confirmLabel}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="border-ink/40 min-h-11 rounded-full border px-5 text-sm font-semibold"
        >
          Annuler
        </button>
      </div>
      {error && <p className="text-accent text-sm font-semibold">{error}</p>}
    </div>
  )
}
