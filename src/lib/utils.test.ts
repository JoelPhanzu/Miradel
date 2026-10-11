import { describe, expect, it } from 'vitest'
import { formatAmount, formatFileSize, formatNumber, formatPhone } from './format'
import { normalizeCongoPhone } from './phone'
import { buildWhatsAppUrl } from './whatsapp'

describe('formatAmount', () => {
  it('affiche les FC avec espace insécable et devise visible', () => {
    expect(formatAmount(5000, 'CDF')).toBe('5 000 FC')
    expect(formatAmount(500, 'CDF')).toBe('500 FC')
  })
  it('affiche les USD à partir des cents', () => {
    expect(formatAmount(1250, 'USD')).toBe('12,50 USD')
    expect(formatAmount(123456, 'USD')).toBe('1 234,56 USD')
  })
})

describe('formatNumber et formatFileSize', () => {
  it('formate les chiffres et les tailles de fichiers', () => {
    expect(formatNumber(1250)).toBe('1 250')
    expect(formatFileSize(850 * 1024)).toBe('850 Ko')
    expect(formatFileSize(2.4 * 1024 * 1024)).toBe('2,4 Mo')
  })
})

describe('normalizeCongoPhone', () => {
  it.each([
    ['0811708299', '+243811708299'],
    ['081 170 82 99', '+243811708299'],
    ['+243 811 708 299', '+243811708299'],
    ['243811708299', '+243811708299'],
    ['00243811708299', '+243811708299'],
  ])('%s -> %s', (input, expected) => {
    expect(normalizeCongoPhone(input)).toBe(expected)
  })
  it('refuse les numéros invalides', () => {
    expect(normalizeCongoPhone('12345')).toBeNull()
    expect(normalizeCongoPhone('08abc')).toBeNull()
    expect(normalizeCongoPhone('+2430811708299')).toBeNull()
  })
  it('affiche le numéro par groupes', () => {
    expect(formatPhone('+243811708299')).toBe('+243 811 708 299')
  })
})

describe('buildWhatsAppUrl', () => {
  it('construit un lien wa.me encodé', () => {
    expect(buildWhatsAppUrl('+243 811 708 299', 'Bonjour à vous')).toBe(
      'https://wa.me/243811708299?text=Bonjour%20%C3%A0%20vous',
    )
    expect(buildWhatsAppUrl('243811708299')).toBe('https://wa.me/243811708299')
  })
})
