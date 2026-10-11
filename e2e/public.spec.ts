import { expect, test } from '@playwright/test'

test('accueil : mission, programmes, aucun prix inventé', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Autonomiser les femmes')
  await expect(page.getByRole('heading', { name: 'Agriculture durable' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Concentré de Piment' })).toBeVisible()
  // Les prix faux de l'ancien site (« Fr 3,00 »…) ne sont jamais repris.
  await expect(page.getByText(/Fr\s?\d+,00/)).toHaveCount(0)
  await expect(page.getByText('Prix à confirmer').first()).toBeVisible()
})

test('pages principales accessibles', async ({ page }) => {
  for (const [path, heading] of [
    ['/la-fondation', 'La Fondation'],
    ['/nos-programmes', 'Nos programmes'],
    ['/nos-programmes/sante-communautaire', 'Santé communautaire'],
    ['/notre-impact', 'Notre impact'],
    ['/transparence', 'Transparence'],
    ['/boutique', 'Boutique solidaire'],
    ['/boutique/c/hygiene', 'Hygiène'],
    ['/produits/yaourt-naturel', 'Yaourt Naturel'],
    ['/promotions', 'Offres du moment'],
    ['/sengager', 'S’engager'],
    ['/sengager/faire-un-don', 'Faire un don'],
    ['/actualites', 'Actualités'],
    ['/contact', 'Contact'],
    ['/conditions-generales', 'Conditions générales'],
    ['/politique-de-confidentialite', 'Politique de confidentialité'],
  ] as const) {
    await page.goto(path)
    await expect(page.getByRole('heading', { level: 1 })).toContainText(heading)
  }
})

test('informations manquantes signalées, jamais inventées', async ({ page }) => {
  await page.goto('/transparence')
  await expect(page.getByText('[À COMPLÉTER]').first()).toBeVisible()
  await page.goto('/la-fondation')
  await expect(page.getByText('[À COMPLÉTER]').first()).toBeVisible()
})

test('produit au prix à confirmer : demande sur WhatsApp, pas de panier', async ({ page }) => {
  await page.goto('/produits/piment-seche')
  await expect(page.getByText('Prix à confirmer')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Ajouter au panier' })).toHaveCount(0)
  const link = page.getByRole('link', { name: 'Demander le prix sur WhatsApp' })
  await expect(link).toHaveAttribute('href', /^https:\/\/wa\.me\/243811708299\?text=/)
})

test('contact : coordonnées, Facebook, lien de confidentialité non vide', async ({ page }) => {
  await page.goto('/contact')
  const main = page.locator('main')
  await expect(main.getByRole('link', { name: 'sylviekashama@gmail.com' })).toBeVisible()
  await expect(main.getByRole('link', { name: 'Politique de confidentialité' })).toHaveAttribute(
    'href',
    '/politique-de-confidentialite',
  )
  await expect(page.locator('footer').getByRole('link', { name: 'Facebook' })).toHaveAttribute(
    'href',
    'https://www.facebook.com/profile.php?id=61586886501323',
  )
  // Comptes inexistants de l'ancien site retirés.
  await expect(page.getByRole('link', { name: 'Instagram' })).toHaveCount(0)
})

test('redirections 301 depuis l’ancien WordPress', async ({ request }) => {
  for (const [from, to] of [
    ['/product/yaourt-naturel/', '/produits/yaourt-naturel'],
    ['/nos-produits/', '/boutique'],
    ['/shop/', '/boutique'],
    ['/mon-compte/', '/panier'],
    ['/accueil/', '/boutique/c/agro-alimentaire'],
  ] as const) {
    const response = await request.get(from)
    expect(response.url(), from).toMatch(new RegExp(`${to}$`))
    expect(response.status(), from).toBe(200)
  }
})

test('référencement : sitemap, robots, aperçu de partage', async ({ request }) => {
  const sitemap = await (await request.get('/sitemap.xml')).text()
  expect(sitemap).toContain('/nos-programmes/agriculture-durable')
  expect(await (await request.get('/robots.txt')).text()).toContain('Disallow: /admin')
  const og = await request.get('/opengraph-image')
  expect(og.headers()['content-type']).toContain('image/png')
})
