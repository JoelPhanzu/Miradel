import { expect, test } from '@playwright/test'
import { loginAsOwner, save, setProductPrice } from './helpers'

/** Plus petit PDF valide (signature « %PDF- »), généré à la volée. */
const samplePdf = Buffer.from(
  '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Kids[]/Count 0>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n',
)

test('admin protégé : sans connexion, retour à la page de connexion', async ({ page }) => {
  await page.goto('/admin/programmes')
  await expect(page).toHaveURL(/\/admin\/connexion/)
})

test('connexion refusée avec un mauvais mot de passe', async ({ page }) => {
  await page.goto('/admin/connexion')
  await page.getByLabel('Adresse e-mail').fill('inconnu@miradel.test')
  await page.getByLabel('Mot de passe').fill('mauvais-mot-de-passe')
  await page.getByRole('button', { name: 'Se connecter' }).click()
  await expect(page.getByText('Adresse e-mail ou mot de passe incorrect.')).toBeVisible()
})

test('prix saisi dans l’admin : visible immédiatement sur le site', async ({ page }) => {
  await loginAsOwner(page)
  await setProductPrice(page, 'Piment Séché', '2 500')
  await page.goto('/produits/piment-seche')
  await expect(page.locator('#contenu').getByText(/2\s500\sFC/).first()).toBeVisible()
  await setProductPrice(page, 'Piment Séché', '')
  await page.goto('/produits/piment-seche')
  await expect(page.getByText('Prix à confirmer')).toBeVisible()
})

test('programme : modification visible sur le site', async ({ page }) => {
  await loginAsOwner(page)
  await page.goto('/admin/programmes')
  await page.getByRole('link', { name: /Agriculture durable/ }).click()
  await page.getByLabel('Zones d’intervention').fill('Zone de test')
  await save(page)
  await page.goto('/nos-programmes/agriculture-durable')
  await expect(page.getByText('Zone de test')).toBeVisible()
  // Remise à l'état initial.
  await page.goBack()
  await page.getByLabel('Zones d’intervention').fill('[À COMPLÉTER]')
  await save(page)
})

test('chiffre d’impact : source obligatoire', async ({ page }) => {
  await loginAsOwner(page)
  await page.goto('/admin/impact/nouveau')
  await page.getByLabel('Valeur').fill('12')
  await page.getByLabel('Ce qui est compté').fill('test')
  await page.locator('button[type="submit"]').filter({ hasText: 'Ajouter le chiffre' }).click()
  await expect(page.getByText('Indiquez la source du chiffre (obligatoire)').first()).toBeVisible()
})

test('témoignage : publication impossible sans l’accord de la personne', async ({ page }) => {
  await loginAsOwner(page)
  await page.goto('/admin/temoignages/nouveau')
  await page.getByLabel('Nom affiché').fill('Personne T.')
  await page.getByLabel('Texte du témoignage').fill('Témoignage de test.')
  await page.getByText('Publier sur le site').click()
  await page.locator('button[type="submit"]').filter({ hasText: 'Ajouter le témoignage' }).click()
  await expect(page.getByText(/accord de la personne/).last()).toBeVisible()
})

test('document PDF : envoi, publication sur la page Transparence', async ({ page }) => {
  const title = `Rapport test ${Date.now()}`
  await loginAsOwner(page)
  await page.goto('/admin/documents/nouveau')
  await page.waitForLoadState('networkidle')
  await page
    .locator('input[type=file]')
    .setInputFiles({ name: 'rapport.pdf', mimeType: 'application/pdf', buffer: samplePdf })
  await expect(page.locator('input[name=fileUrl]')).toHaveValue(/^\/media\/documents\/.+\.pdf$/, {
    timeout: 30_000,
  })
  await page.getByLabel('Titre').fill(title)
  await page.getByLabel('Année').fill('2025')
  await page.locator('button[type="submit"]').filter({ hasText: 'Ajouter le document' }).click()
  await expect(page).toHaveURL(/\/admin\/documents\/[0-9a-f-]{36}$/)

  await page.goto('/transparence')
  const link = page.getByRole('link', { name: new RegExp(title) })
  await expect(link).toBeVisible()
  expect((await page.request.get((await link.getAttribute('href'))!)).headers()['content-type']).toBe(
    'application/pdf',
  )

  // Nettoyage.
  await page.goto('/admin/documents')
  await page.getByRole('link', { name: new RegExp(title) }).click()
  await page.getByRole('button', { name: 'Supprimer le document' }).click()
  await page.getByRole('button', { name: 'Oui, supprimer définitivement' }).click()
  await expect(page).toHaveURL(/\/admin\/documents$/)
})

test('dons : confirmation d’une déclaration', async ({ page }) => {
  await loginAsOwner(page)
  await page.goto('/admin/dons')
  const first = page.locator('main li a').first()
  test.skip((await first.count()) === 0, 'Aucune déclaration de don en attente')
  await first.click()
  await page.getByRole('button', { name: 'confirmé' }).click()
  await expect(page.getByRole('button', { name: 'confirmé' })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
})
