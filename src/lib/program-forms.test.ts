import { describe, expect, it } from 'vitest'
import type { FormFieldDef } from '@/db/schema'
import { checkFieldDefs, isFormOpen, sanitizeFieldDefs, validateAnswers } from './program-forms'

const fields: FormFieldDef[] = [
  { id: 'f_nom0000', label: 'Nom', type: 'text', required: true },
  { id: 'f_tel0000', label: 'Téléphone', type: 'tel', required: true },
  { id: 'f_mail000', label: 'E-mail', type: 'email', required: false },
  { id: 'f_age0000', label: 'Âge', type: 'number', required: false },
  { id: 'f_nais000', label: 'Né le', type: 'date', required: false },
  {
    id: 'f_metier0',
    label: 'Métier',
    type: 'select',
    required: true,
    options: ['Couture', 'Coiffure'],
  },
  {
    id: 'f_dispo00',
    label: 'Disponibilités',
    type: 'checkboxes',
    required: false,
    options: ['Matin', 'Soir'],
  },
  { id: 'f_accord0', label: 'J’accepte', type: 'consent', required: true },
]

describe('isFormOpen', () => {
  it('ouvert avant la date limite, fermé à partir de celle-ci', () => {
    const closesAt = '2026-11-20T23:00:00.000Z' // 21/11 à 00:00 à Kinshasa
    expect(isFormOpen({ closesAt }, new Date('2026-11-20T22:59:59Z'))).toBe(true)
    expect(isFormOpen({ closesAt }, new Date('2026-11-20T23:00:00Z'))).toBe(false)
  })
  it('fermé sans date limite', () => {
    expect(isFormOpen({ closesAt: null }, new Date())).toBe(false)
  })
})

describe('validateAnswers', () => {
  it('accepte une réponse complète et normalise le téléphone', () => {
    const result = validateAnswers(fields, {
      f_nom0000: ' Neema ',
      f_tel0000: '0811 708 299',
      f_mail000: 'Neema@Exemple.cd',
      f_age0000: '24',
      f_nais000: '2002-03-01',
      f_metier0: 'Couture',
      f_dispo00: ['Soir', 'Inventé'],
      f_accord0: true,
      champ_inconnu: 'ignoré',
    })
    expect(result).toEqual({
      ok: true,
      answers: {
        f_nom0000: 'Neema',
        f_tel0000: '+243811708299',
        f_mail000: 'neema@exemple.cd',
        f_age0000: '24',
        f_nais000: '2002-03-01',
        f_metier0: 'Couture',
        f_dispo00: ['Soir'],
        f_accord0: 'oui',
      },
    })
  })

  it('signale les champs obligatoires, les choix hors liste et les formats', () => {
    const result = validateAnswers(fields, {
      f_tel0000: '12',
      f_mail000: 'pas-un-mail',
      f_age0000: 'vingt',
      f_metier0: 'Maçonnerie',
    })
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(Object.keys(result.errors).sort()).toEqual(
      ['f_accord0', 'f_age0000', 'f_metier0', 'f_mail000', 'f_nom0000', 'f_tel0000'].sort(),
    )
  })
})

describe('définition des champs (admin)', () => {
  it('exige des choix pour une liste et une question pour chaque champ', () => {
    expect(checkFieldDefs([])).toMatch(/au moins un champ/)
    expect(checkFieldDefs([{ id: 'f_a1b2', label: '', type: 'text', required: false }])).toMatch(
      /question/,
    )
    expect(
      checkFieldDefs([
        { id: 'f_a1b2', label: 'Métier', type: 'radio', required: true, options: ['A'] },
      ]),
    ).toMatch(/deux choix/)
    expect(checkFieldDefs(fields)).toBeNull()
  })

  it('nettoie un envoi du navigateur', () => {
    const [field] = sanitizeFieldDefs([
      { id: '<script>', label: '  Âge  ', type: 'inconnu', required: 'oui', options: ['x'] },
    ])
    expect(field.type).toBe('text')
    expect(field.label).toBe('Âge')
    expect(field.id).toMatch(/^f_[a-z0-9]{10}$/)
    expect(field.options).toBeUndefined()
    expect(
      sanitizeFieldDefs([{ label: 'Accord', type: 'consent', required: false }])[0].required,
    ).toBe(true)
  })
})
