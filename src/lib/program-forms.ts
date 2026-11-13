/**
 * Formulaires de participation aux programmes : champs configurés dans l'admin,
 * date limite, validation des réponses (côté serveur, à partir de la définition enregistrée).
 */
import { z } from 'zod'
import type { FormAnswers, FormFieldDef, FormFieldType } from '@/db/schema'
import { normalizeCongoPhone } from './phone'

export const FIELD_TYPE_LABELS: Record<FormFieldType, string> = {
  text: 'Texte court',
  textarea: 'Texte long',
  tel: 'Téléphone',
  email: 'E-mail',
  number: 'Nombre',
  date: 'Date',
  select: 'Liste déroulante',
  radio: 'Choix unique',
  checkboxes: 'Cases à cocher (plusieurs choix)',
  consent: 'Case d’accord (ex. « J’accepte… »)',
}

/** Types qui demandent une liste de choix. */
export const TYPES_WITH_OPTIONS: FormFieldType[] = ['select', 'radio', 'checkboxes']

const MAX_LENGTH: Partial<Record<FormFieldType, number>> = { textarea: 3000 }

/** Champs proposés à la création d'un formulaire (modifiables). */
export function starterFields(): FormFieldDef[] {
  return [
    { id: newFieldId(), label: 'Nom complet', type: 'text', required: true },
    { id: newFieldId(), label: 'Téléphone (WhatsApp)', type: 'tel', required: true },
    { id: newFieldId(), label: 'Commune / ville', type: 'text', required: false },
  ]
}

export function newFieldId(): string {
  return `f_${crypto.randomUUID().replace(/-/g, '').slice(0, 10)}`
}

/** Ouvert seulement avant la date limite. Sans date limite saisie : fermé (par prudence). */
export function isFormOpen(form: { closesAt: string | Date | null }, now: Date): boolean {
  if (!form.closesAt) return false
  return now.getTime() < new Date(form.closesAt).getTime()
}

/** Contrôle la définition saisie dans l'admin. Renvoie un message d'erreur ou null. */
export function checkFieldDefs(fields: FormFieldDef[]): string | null {
  if (fields.length === 0) return 'Ajoutez au moins un champ'
  if (fields.length > 40) return '40 champs au maximum'
  const ids = new Set<string>()
  for (const [i, f] of fields.entries()) {
    const n = i + 1
    if (!f.label?.trim()) return `Champ n° ${n} : indiquez la question`
    if (!f.id || ids.has(f.id)) return `Champ n° ${n} : identifiant invalide`
    ids.add(f.id)
    if (TYPES_WITH_OPTIONS.includes(f.type) && (f.options ?? []).filter(Boolean).length < 2) {
      return `Champ « ${f.label} » : indiquez au moins deux choix`
    }
  }
  return null
}

/** Nettoie une définition reçue du navigateur (types inconnus, choix vides…). */
export function sanitizeFieldDefs(raw: unknown): FormFieldDef[] {
  if (!Array.isArray(raw)) return []
  return raw.slice(0, 40).map((item) => {
    const f = (item ?? {}) as Partial<FormFieldDef>
    const type = (Object.keys(FIELD_TYPE_LABELS) as FormFieldType[]).includes(
      f.type as FormFieldType,
    )
      ? (f.type as FormFieldType)
      : 'text'
    return {
      id: typeof f.id === 'string' && /^f_[a-z0-9]{4,20}$/.test(f.id) ? f.id : newFieldId(),
      label: String(f.label ?? '')
        .trim()
        .slice(0, 200),
      type,
      required: type === 'consent' ? true : Boolean(f.required),
      help: f.help ? String(f.help).trim().slice(0, 300) || null : null,
      options: TYPES_WITH_OPTIONS.includes(type)
        ? (f.options ?? [])
            .map((o) => String(o).trim().slice(0, 120))
            .filter(Boolean)
            .slice(0, 30)
        : undefined,
    }
  })
}

type ValidationResult =
  { ok: true; answers: FormAnswers } | { ok: false; errors: Record<string, string> }

/** Valide les réponses d'un visiteur à partir de la définition enregistrée. */
export function validateAnswers(fields: FormFieldDef[], raw: unknown): ValidationResult {
  const input = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  const answers: FormAnswers = {}
  const errors: Record<string, string> = {}

  for (const field of fields) {
    const value = input[field.id]

    if (field.type === 'checkboxes') {
      const list = Array.isArray(value) ? value.map(String) : []
      const valid = list.filter((v) => field.options?.includes(v))
      if (field.required && valid.length === 0) errors[field.id] = 'Cochez au moins un choix'
      else if (valid.length) answers[field.id] = valid
      continue
    }

    if (field.type === 'consent') {
      if (value !== true && value !== 'on' && value !== 'oui') {
        if (field.required) errors[field.id] = 'Cochez cette case pour continuer'
      } else answers[field.id] = 'oui'
      continue
    }

    const text = typeof value === 'string' ? value.trim() : ''
    if (!text) {
      if (field.required) errors[field.id] = 'Ce champ est obligatoire'
      continue
    }
    if (text.length > (MAX_LENGTH[field.type] ?? 300)) {
      errors[field.id] = 'Réponse trop longue'
      continue
    }

    switch (field.type) {
      case 'tel': {
        const phone = normalizeCongoPhone(text)
        if (!phone) errors[field.id] = 'Numéro invalide (ex. 0811 708 299)'
        else answers[field.id] = phone
        break
      }
      case 'email':
        if (!z.email().safeParse(text.toLowerCase()).success) {
          errors[field.id] = 'Adresse e-mail invalide'
        } else answers[field.id] = text.toLowerCase()
        break
      case 'number':
        if (!/^-?\d+([.,]\d+)?$/.test(text.replace(/\s/g, ''))) {
          errors[field.id] = 'Indiquez un nombre'
        } else answers[field.id] = text.replace(/\s/g, '')
        break
      case 'date':
        if (!/^\d{4}-\d{2}-\d{2}$/.test(text) || Number.isNaN(Date.parse(text))) {
          errors[field.id] = 'Date invalide'
        } else answers[field.id] = text
        break
      case 'select':
      case 'radio':
        if (!field.options?.includes(text)) errors[field.id] = 'Choisissez une réponse proposée'
        else answers[field.id] = text
        break
      default:
        answers[field.id] = text
    }
  }

  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, answers }
}

/** Réponse lisible (admin, export CSV). */
export function answerText(value: string | string[] | undefined): string {
  if (value === undefined) return ''
  return Array.isArray(value) ? value.join(', ') : value
}

/** Première réponse de type téléphone (bouton « Répondre sur WhatsApp » de l'admin). */
export function findPhone(fields: FormFieldDef[], answers: FormAnswers): string | null {
  const field = fields.find((f) => f.type === 'tel' && typeof answers[f.id] === 'string')
  return field ? (answers[field.id] as string) : null
}

/** Première réponse texte (nom affiché dans la liste des réponses). */
export function findName(fields: FormFieldDef[], answers: FormAnswers): string | null {
  const field = fields.find((f) => f.type === 'text' && typeof answers[f.id] === 'string')
  return field ? (answers[field.id] as string) : null
}
