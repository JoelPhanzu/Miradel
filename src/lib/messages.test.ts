import { describe, expect, it } from 'vitest'
import { looksLikeSpam } from './antispam'
import { formatLongDate, kinshasaDateString } from './dates'
import { buildDonationMessage, buildOrderMessage } from './messages'
import { generateReference } from './reference'
import { contactSchema, donationSchema, newsletterSchema, orderSchema } from './validation/public'

const ORG = 'Fondation MIRADEL FEVEPA'

describe('buildOrderMessage', () => {
  it('récapitule lignes, total, paiement et livraison', () => {
    const text = buildOrderMessage({
      organizationName: ORG,
      reference: 'C-9XMP2',
      customerName: 'Grâce',
      customerPhone: '+243811708299',
      deliveryMode: 'livraison',
      deliveryCommune: 'Gombe',
      paymentLabel: 'Mobile money',
      lines: [{ name: 'Yaourt Naturel', variant: { contenance: '1 L' }, quantity: 2, unitAmount: 1500 }],
      totalAmount: 3000,
      currency: 'CDF',
    })
    expect(text).toContain(`Bonjour ${ORG}`)
    expect(text).toContain('- 2 x Yaourt Naturel (1 L) : 3 000 FC')
    expect(text).toContain('Total : 3 000 FC')
    expect(text).toContain('Livraison : Gombe')
    expect(text).toContain('Référence : C-9XMP2')
  })

  it('indique le retrait sur place et reste valable sans référence', () => {
    const text = buildOrderMessage({
      organizationName: ORG,
      reference: null,
      customerName: 'Grâce',
      customerPhone: '+243811708299',
      deliveryMode: 'retrait',
      paymentLabel: 'Paiement au retrait',
      lines: [{ name: 'Piment Séché', quantity: 1, unitAmount: 1250 }],
      totalAmount: 1250,
      currency: 'USD',
    })
    expect(text).toContain('Retrait sur place')
    expect(text).toContain('12,50 USD')
    expect(text).not.toContain('Référence')
  })
})

describe('buildDonationMessage', () => {
  it('récapitule le don, sans nom si anonyme', () => {
    const text = buildDonationMessage({
      organizationName: ORG,
      reference: 'D-7K3QF',
      donorName: null,
      amount: 2500,
      currency: 'USD',
      methodLabel: 'Mobile money',
      transactionReference: 'MP123',
      programTitle: 'Éducation inclusive',
    })
    expect(text).toContain('Montant : 25,00 USD')
    expect(text).toContain('Référence de transaction : MP123')
    expect(text).toContain('Programme soutenu : Éducation inclusive')
    expect(text).toContain('Nom : Anonyme')
  })
})

describe('orderSchema', () => {
  const valid = {
    customerName: 'Grâce',
    customerPhone: '081 170 82 99',
    deliveryMode: 'livraison',
    deliveryCommune: 'Gombe',
    paymentMethod: 'mobile_money',
    items: [{ productId: 'p1', quantity: 2 }],
  }
  it('normalise le téléphone', () => {
    expect(orderSchema.parse(valid).customerPhone).toBe('+243811708299')
  })
  it('exige la commune pour une livraison, pas pour un retrait', () => {
    expect(orderSchema.safeParse({ ...valid, deliveryCommune: '' }).success).toBe(false)
    expect(
      orderSchema.safeParse({ ...valid, deliveryMode: 'retrait', deliveryCommune: '' }).success,
    ).toBe(true)
  })
  it('refuse le paiement à la livraison pour un retrait', () => {
    expect(
      orderSchema.safeParse({ ...valid, deliveryMode: 'retrait', paymentMethod: 'cash_livraison' })
        .success,
    ).toBe(false)
  })
})

describe('donationSchema', () => {
  const valid = {
    donorName: 'Jean',
    donorPhone: '0811708299',
    amount: 10000,
    currency: 'CDF',
    paymentMethod: 'mobile_money',
  }
  it('accepte un don nominatif ou anonyme', () => {
    expect(donationSchema.safeParse(valid).success).toBe(true)
    expect(donationSchema.safeParse({ ...valid, donorName: '', isAnonymous: true }).success).toBe(
      true,
    )
  })
  it('exige un nom si le don n’est pas anonyme, et un montant positif', () => {
    expect(donationSchema.safeParse({ ...valid, donorName: '' }).success).toBe(false)
    expect(donationSchema.safeParse({ ...valid, amount: 0 }).success).toBe(false)
  })
})

describe('contactSchema', () => {
  const valid = { kind: 'benevolat', fullName: 'Marie', message: 'Je souhaite aider.' }
  it('exige un téléphone ou un e-mail', () => {
    expect(contactSchema.safeParse(valid).success).toBe(false)
    expect(contactSchema.safeParse({ ...valid, email: 'marie@exemple.cd' }).success).toBe(true)
    expect(contactSchema.parse({ ...valid, phone: '0811708299' }).phone).toBe('+243811708299')
  })
})

describe('newsletterSchema', () => {
  it('exige le consentement', () => {
    expect(newsletterSchema.safeParse({ email: 'a@b.cd', consent: true }).success).toBe(true)
    expect(newsletterSchema.safeParse({ email: 'a@b.cd', consent: false }).success).toBe(false)
  })
})

describe('looksLikeSpam', () => {
  const now = 1_000_000
  it('détecte le champ piège rempli ou un envoi trop rapide', () => {
    expect(looksLikeSpam({ website: 'http://spam', startedAt: now - 10_000 }, now)).toBe(true)
    expect(looksLikeSpam({ startedAt: now - 500 }, now)).toBe(true)
    expect(looksLikeSpam({}, now)).toBe(true)
    expect(looksLikeSpam({ website: '', startedAt: now - 10_000 }, now)).toBe(false)
  })
})

describe('dates', () => {
  it('donne la date de Kinshasa, pas celle d’UTC', () => {
    expect(kinshasaDateString(new Date('2026-10-12T23:30:00Z'))).toBe('2026-10-13')
    expect(formatLongDate('2026-10-12T23:30:00Z')).toBe('13 octobre 2026')
  })
})

describe('generateReference', () => {
  it('produit une référence courte sans caractères ambigus', () => {
    expect(generateReference('C')).toMatch(/^C-[A-HJKMNP-Z2-9]{5}$/)
    expect(generateReference('D')).toMatch(/^D-[A-HJKMNP-Z2-9]{5}$/)
  })
})
