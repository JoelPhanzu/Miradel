import { expect, test } from '@playwright/test'
import { captureWhatsApp, loginAsOwner, setProductPrice, waitLikeAHuman } from './helpers'

test('commande : prix recalculé par le serveur, enregistrée, WhatsApp avec référence', async ({
  page,
}) => {
  // Prix de test saisi dans l'admin, puis effacé (les vrais prix restent à confirmer).
  await loginAsOwner(page)
  await setProductPrice(page, 'Yaourt Naturel', '1 500')

  const whatsapp = await captureWhatsApp(page)
  await page.goto('/produits/yaourt-naturel')
  await page.getByRole('button', { name: 'Augmenter la quantité' }).click()
  await page.getByRole('button', { name: 'Ajouter au panier' }).click()
  await page.getByRole('link', { name: 'Voir le panier' }).click()

  await expect(page.getByText(/3\s000\sFC/).first()).toBeVisible()
  await page.getByLabel('Nom complet').fill('Client Test')
  await page.getByLabel('Téléphone (WhatsApp)').fill('081 170 82 99')
  await page.getByLabel('Commune').fill('Gombe')
  await waitLikeAHuman(page)
  await page.getByRole('button', { name: 'Commander sur WhatsApp' }).click()

  const url = await whatsapp()
  expect(url.pathname).toBe('/243811708299')
  const text = url.searchParams.get('text') ?? ''
  expect(text).toMatch(/- 2 x Yaourt Naturel : 3\s000\sFC/)
  expect(text).toContain('Livraison : Gombe')
  expect(text).toMatch(/Référence : C-[A-Z0-9]{5}/)

  await page.goto('/admin/commandes')
  await expect(page.getByText(/Client Test/).first()).toBeVisible()
  await setProductPrice(page, 'Yaourt Naturel', '')
})

test('don : déclaration enregistrée, référence et lien WhatsApp', async ({ page }) => {
  await page.goto('/sengager/faire-un-don?programme=education-inclusive')
  await expect(page.getByLabel('Programme soutenu')).toHaveValue('education-inclusive')
  await page.getByRole('button', { name: 'Dollars (USD)' }).click()
  await page.getByLabel('Montant (USD)').fill('25')
  await page.getByLabel('Référence de la transaction').fill('MP-TEST-1')
  await page.getByLabel('Nom', { exact: true }).fill('Donateur Test')
  await page.getByLabel('Téléphone (WhatsApp)').fill('0811708299')
  await waitLikeAHuman(page)
  await page.getByRole('button', { name: 'Déclarer mon don' }).click()

  await expect(page.getByText(/Votre référence : D-[A-Z0-9]{5}/)).toBeVisible()
  const link = page.getByRole('link', { name: 'Prévenir la fondation sur WhatsApp' })
  const text = new URL((await link.getAttribute('href'))!).searchParams.get('text') ?? ''
  expect(text).toMatch(/Montant : 25,00\sUSD/)
  expect(text).toContain('Programme soutenu : Éducation inclusive')
})

test('formulaire envoyé trop vite : refusé (anti-robot)', async ({ page }) => {
  await page.goto('/contact')
  await page.getByLabel('Nom complet').fill('Robot')
  await page.locator('#contact-email').fill('robot@exemple.cd')
  await page.getByLabel('Votre message').fill('Message envoyé immédiatement.')
  await page.getByRole('button', { name: 'Envoyer le message' }).click()
  await expect(page.getByText('Envoi refusé.')).toBeVisible()
})

test('bénévolat : message enregistré dans l’admin', async ({ page }) => {
  const name = `Bénévole ${Date.now()}`
  await page.goto('/sengager')
  const form = page.locator('#benevolat')
  await form.getByLabel('Nom complet').fill(name)
  await form.getByLabel('Téléphone (WhatsApp)').fill('0811708299')
  await form.getByLabel(/Vos disponibilités/).fill('Disponible le samedi.')
  await waitLikeAHuman(page)
  await form.getByRole('button', { name: 'Proposer mon aide' }).click()
  await expect(page.getByText(/Merci pour votre proposition/)).toBeVisible()

  await loginAsOwner(page)
  await page.goto('/admin/messages?type=benevolat')
  await expect(page.getByText(name)).toBeVisible()
})

test('newsletter : inscription avec consentement', async ({ page }) => {
  await page.goto('/')
  const footer = page.locator('footer')
  await footer.getByLabel('Recevoir nos nouvelles').fill(`abonne${Date.now()}@exemple.cd`)
  await footer.getByRole('checkbox').check()
  await waitLikeAHuman(page)
  await footer.getByRole('button', { name: 'S’inscrire' }).click()
  await expect(footer.getByText('Merci ! Vous recevrez nos nouvelles.')).toBeVisible()
})
