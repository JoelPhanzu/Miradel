import type {
  DOCUMENT_TYPES,
  DONATION_STATUSES,
  MESSAGE_KINDS,
  MESSAGE_STATUSES,
  ORDER_STATUSES,
  PROGRAM_STATUSES,
} from '@/db/schema'

type Tone = 'neutral' | 'success' | 'warning' | 'muted'

export const ORDER_TONES: Record<(typeof ORDER_STATUSES)[number], Tone> = {
  nouvelle: 'warning',
  confirmée: 'neutral',
  payée: 'success',
  livrée: 'muted',
  annulée: 'muted',
}

export const DONATION_TONES: Record<(typeof DONATION_STATUSES)[number], Tone> = {
  déclaré: 'warning',
  confirmé: 'success',
  rejeté: 'muted',
}

export const MESSAGE_TONES: Record<(typeof MESSAGE_STATUSES)[number], Tone> = {
  nouveau: 'warning',
  en_cours: 'neutral',
  traité: 'muted',
}

export const MESSAGE_STATUS_LABELS: Record<(typeof MESSAGE_STATUSES)[number], string> = {
  nouveau: 'Nouveau',
  en_cours: 'En cours',
  traité: 'Traité',
}

export const MESSAGE_KIND_LABELS: Record<(typeof MESSAGE_KINDS)[number], string> = {
  contact: 'Contact',
  benevolat: 'Bénévolat',
  partenariat: 'Partenariat',
}

export const PROGRAM_STATUS_LABELS: Record<(typeof PROGRAM_STATUSES)[number], string> = {
  en_cours: 'En cours',
  termine: 'Terminé',
  en_preparation: 'En préparation',
}

export const DOCUMENT_TYPE_LABELS: Record<(typeof DOCUMENT_TYPES)[number], string> = {
  statuts: 'Statuts',
  agrement: 'Agrément',
  rapport_activite: 'Rapport d’activité',
  rapport_financier: 'Rapport financier',
  autre: 'Autre document',
}

export const ROLE_LABELS = {
  owner: 'Responsable',
  editor: 'Équipe',
  lean_admin: 'Lean Market',
} as const
