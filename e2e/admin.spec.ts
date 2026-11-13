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
  await expect(
    page
      .locator('#contenu')
      .getByText(/2\s500\sFC/)
      .first(),
  ).toBeVisible()
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
  expect(
    (await page.request.get((await link.getAttribute('href'))!)).headers()['content-type'],
  ).toBe('application/pdf')

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

test('formulaire de participation : champs configurés, envoi, fermeture à la date limite', async ({
  page,
}) => {
  const title = `Inscription test ${Date.now()}`
  await loginAsOwner(page)
  await page.goto('/admin/formulaires/nouveau')
  await page.getByText('Afficher sur la page du programme').click()
  await page.getByLabel('Date et heure limites (heure de Kinshasa)').fill('2099-12-31T23:59')
  await page.getByLabel('Programme', { exact: true }).selectOption({ label: 'Éducation inclusive' })
  await page.getByLabel('Titre').fill(title)
  // Champ supplémentaire : choix unique.
  await page.getByRole('button', { name: 'Ajouter un champ' }).click()
  await page.getByLabel('Question').last().fill('Métier souhaité')
  await page.getByLabel('Type de réponse').last().selectOption('radio')
  await page.getByLabel('Choix proposés (un par ligne)').fill('Couture\nCoiffure')
  await page.locator('button[type="submit"]').filter({ hasText: 'Créer le formulaire' }).click()
  await expect(page).toHaveURL(/\/admin\/formulaires\/[0-9a-f-]{36}$/)
  const adminUrl = page.url()

  // Côté public : le formulaire s'affiche sur la page du programme et s'envoie.
  await page.goto('/nos-programmes/education-inclusive')
  const section = page.locator('#participer')
  await expect(section.getByRole('heading', { name: title })).toBeVisible()
  await section.getByLabel('Nom complet').fill('Participante Test')
  await section.getByLabel('Téléphone (WhatsApp)').fill('0811 708 299')
  await section.getByLabel('Coiffure').check()
  await page.waitForTimeout(3_200)
  await section.getByRole('button', { name: 'Envoyer ma participation' }).click()
  await expect(section.getByRole('status')).toContainText('Merci')

  // La réponse arrive dans l'admin.
  await page.goto(`${adminUrl}/reponses`)
  await expect(page.getByText('Participante Test').first()).toBeVisible()
  await expect(page.getByText('Coiffure')).toBeVisible()

  // Date limite passée : le formulaire n'est plus accessible.
  await page.goto(adminUrl)
  await page.getByLabel('Date et heure limites (heure de Kinshasa)').fill('2020-01-01T00:00')
  await save(page)
  await page.goto('/nos-programmes/education-inclusive')
  await expect(page.locator('#participer').getByText(/inscriptions closes/)).toBeVisible()
  await expect(page.getByRole('button', { name: 'Envoyer ma participation' })).toHaveCount(0)

  // Nettoyage.
  await page.goto(adminUrl)
  await page.getByRole('button', { name: 'Supprimer le formulaire et ses réponses' }).click()
  await page.getByRole('button', { name: 'Oui, supprimer définitivement' }).click()
  await expect(page).toHaveURL(/\/admin\/formulaires$/)
})

test('vitrine : un entrepreneur, son produit, commande directe sur son WhatsApp', async ({
  page,
}) => {
  const name = `Atelier test ${Date.now()}`
  await loginAsOwner(page)
  await page.goto('/admin/entrepreneurs/nouveau')
  await page.getByText('Publier la vitrine').click()
  await page.getByLabel('Nom de l’activité ou de la boutique').fill(name)
  await page.getByLabel('Numéro WhatsApp de l’entrepreneur (facultatif)').fill('0990 000 001')
  await page.locator('button[type="submit"]').filter({ hasText: 'Créer la vitrine' }).click()
  await expect(page).toHaveURL(/\/admin\/entrepreneurs\/[0-9a-f-]{36}$/)
  const entrepreneurUrl = page.url()

  await page.goto('/admin/produits/nouveau')
  await page.getByLabel('Nom du produit').fill(`Produit de ${name}`)
  await page.getByLabel('Vendu par').selectOption({ label: name })
  await page.locator('button[type="submit"]').filter({ hasText: 'Créer le produit' }).click()
  await expect(page).toHaveURL(/\/admin\/produits\/[0-9a-f-]{36}$/)
  const productUrl = page.url()

  await page.goto('/vitrine')
  await page.getByRole('link', { name: `Voir la vitrine de ${name}` }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(name)
  await page
    .getByRole('link', { name: `Produit de ${name}` })
    .first()
    .click()
  await expect(page.getByRole('button', { name: 'Ajouter au panier' })).toHaveCount(0)
  await expect(page.getByRole('link', { name: `Commander auprès de ${name}` })).toHaveAttribute(
    'href',
    /^https:\/\/wa\.me\/243990000001\?text=/,
  )

  // Nettoyage : le produit d'abord (une vitrine avec produits ne se supprime pas).
  await page.goto(entrepreneurUrl)
  await page.getByRole('button', { name: 'Supprimer la vitrine' }).click()
  await page.getByRole('button', { name: 'Oui, supprimer définitivement' }).click()
  await expect(page.getByText(/encore 1 produit/)).toBeVisible()
  await page.goto(productUrl)
  await page.getByRole('button', { name: 'Supprimer le produit' }).click()
  await page.getByRole('button', { name: 'Oui, supprimer définitivement' }).click()
  await page.goto(entrepreneurUrl)
  await page.getByRole('button', { name: 'Supprimer la vitrine' }).click()
  await page.getByRole('button', { name: 'Oui, supprimer définitivement' }).click()
  await expect(page).toHaveURL(/\/admin\/entrepreneurs$/)
})
