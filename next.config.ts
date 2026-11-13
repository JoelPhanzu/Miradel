import type { NextConfig } from 'next'

/**
 * Redirections 301 depuis l'ancien site WordPress (CLAUDE.md §11), pour garder le référencement.
 * À compléter avec les autres anciennes URL relevées dans l'export WordPress.
 */
const LEGACY_REDIRECTS: { source: string; destination: string }[] = [
  { source: '/product/:slug', destination: '/produits/:slug' },
  { source: '/nos-produits', destination: '/vitrine' },
  { source: '/shop', destination: '/vitrine' },
  { source: '/commander', destination: '/vitrine' },
  // Ancien lien de la carte « Agro-alimentaire » (pointait vers l'accueil) — à vérifier.
  { source: '/accueil', destination: '/vitrine/produits?categorie=agro-alimentaire' },
  // « Boutique solidaire » est devenue « Vitrine de l'entrepreneur » (13/11/2026).
  { source: '/boutique', destination: '/vitrine' },
  { source: '/boutique/c/:slug', destination: '/vitrine/produits?categorie=:slug' },
  { source: '/mon-compte', destination: '/panier' },
  { source: '/paiement', destination: '/panier' },
]

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Les anciennes adresses WordPress finissent par « / » : Next retire d'abord ce « / »,
  // puis applique ces redirections.
  async redirects() {
    return LEGACY_REDIRECTS.map((r) => ({ ...r, permanent: true }))
  },
}

export default nextConfig
