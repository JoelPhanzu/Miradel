/**
 * Contenus de départ, repris de l'ancien site miradel.org (CLAUDE.md §1).
 * Rien n'est inventé : ce qui manque est marqué [À COMPLÉTER] (voir docs/a-completer.md)
 * et les prix de l'ancien site, manifestement faux, ne sont PAS repris (prix à confirmer).
 * Source unique pour le remplissage de la base (seed-content.ts) et pour le mode sans base.
 * Une fois la base remplie, tout se modifie dans l'admin.
 */
import type { PaymentNumber, SocialLinks, SuggestedAmount } from './schema'

export const TO_COMPLETE = '[À COMPLÉTER]'

export const seedSettings = {
  organizationName: 'Fondation MIRADEL FEVEPA',
  acronym: null as string | null,
  tagline:
    'Autonomiser les femmes et les jeunes vulnérables en RDC par des actions concrètes et durables.',
  legalStatus: null as string | null,
  registrationNumber: null as string | null,
  address: null as string | null,
  googleMapsUrl: null as string | null,
  phone: '+243811708299',
  whatsappNumber: '243811708299',
  emails: ['sylviekashama@gmail.com'],
  // Instagram et TikTok de l'ancien site pointaient vers les pages d'accueil des réseaux : retirés.
  socialLinks: { facebook: 'https://www.facebook.com/profile.php?id=61586886501323' } as SocialLinks,
  // Numéros mobile money et coordonnées bancaires : à saisir par la fondation depuis l'admin.
  paymentNumbers: [] as PaymentNumber[],
  bankDetails: null as string | null,
  // Montants suggérés pour les dons : à fournir par la fondation.
  donationAmounts: [] as SuggestedAmount[],
}

export const seedPrograms: { title: string; slug: string; summary: string }[] = [
  { title: 'Agriculture durable', slug: 'agriculture-durable', summary: TO_COMPLETE },
  {
    title: 'Santé communautaire',
    slug: 'sante-communautaire',
    summary: `Cliniques mobiles. ${TO_COMPLETE}`,
  },
  { title: 'Éducation inclusive', slug: 'education-inclusive', summary: TO_COMPLETE },
  {
    title: 'Protection environnementale',
    slug: 'protection-environnementale',
    summary: `Emplois verts. ${TO_COMPLETE}`,
  },
]

export const seedProductCategories = [
  { key: 'agro', name: 'Agro-alimentaire', slug: 'agro-alimentaire' },
  { key: 'hygiene', name: 'Hygiène', slug: 'hygiene' },
] as const

/** [catégorie, nom, slug] — prix, contenance et description à confirmer par la fondation. */
export const seedProducts: [(typeof seedProductCategories)[number]['key'], string, string][] = [
  ['agro', 'Concentré de Piment', 'concentre-de-piment'],
  ['hygiene', 'Désinfectant Bactérol', 'desinfectant-bacterol'],
  ['hygiene', 'Détergent Multi-Usage', 'detergent-multi-usage'],
  ['agro', 'Piment Séché', 'piment-seche'],
  ['agro', 'Yaourt Naturel', 'yaourt-naturel'],
]

export const seedPageSections: {
  key: string
  title?: string
  subtitle?: string
  body?: string
  buttonLabel?: string
  buttonHref?: string
}[] = [
  // --- Accueil ---------------------------------------------------------------
  {
    key: 'home_hero',
    title: 'Autonomiser les femmes et les jeunes *vulnérables* en RDC',
    body: 'Par des actions concrètes et durables.',
    buttonLabel: 'Faire un don',
    buttonHref: '/sengager/faire-un-don',
  },
  {
    key: 'home_mission',
    title: 'Notre mission',
    body: 'La Fondation MIRADEL FEVEPA agit pour autonomiser les femmes et les jeunes vulnérables en République Démocratique du Congo, par des actions concrètes et durables.',
    buttonLabel: 'Découvrir la fondation',
    buttonHref: '/la-fondation',
  },
  {
    key: 'home_programs',
    title: 'Nos programmes',
    body: 'Agriculture durable, santé communautaire, éducation inclusive et protection environnementale.',
    buttonLabel: 'Tous les programmes',
    buttonHref: '/nos-programmes',
  },
  { key: 'home_impact', title: 'Notre impact', buttonLabel: 'Voir notre impact', buttonHref: '/notre-impact' },
  {
    key: 'home_shop',
    title: 'Boutique solidaire',
    body: 'Des produits locaux fabriqués dans le cadre de nos programmes.',
    buttonLabel: 'Voir la boutique',
    buttonHref: '/boutique',
  },
  { key: 'home_news', title: 'Actualités', buttonLabel: 'Toutes les actualités', buttonHref: '/actualites' },
  {
    key: 'home_cta',
    title: 'S’engager à nos côtés',
    body: 'Faire un don, devenir bénévole ou construire un partenariat.',
    buttonLabel: 'S’engager',
    buttonHref: '/sengager',
  },
  // --- La fondation -----------------------------------------------------------
  {
    key: 'foundation_intro',
    title: 'La Fondation',
    body: 'Autonomiser les femmes et les jeunes vulnérables en RDC par des actions concrètes et durables.',
  },
  { key: 'foundation_history', title: 'Notre histoire', body: TO_COMPLETE },
  { key: 'foundation_governance', title: 'Gouvernance', body: TO_COMPLETE },
  { key: 'foundation_team', title: 'L’équipe' },
  { key: 'foundation_partners', title: 'Nos partenaires' },
  // --- Pages intérieures -------------------------------------------------------
  { key: 'programs_intro', title: 'Nos programmes', body: TO_COMPLETE },
  { key: 'impact_intro', title: 'Notre impact', body: TO_COMPLETE },
  {
    key: 'transparency_intro',
    title: 'Transparence',
    body: 'Statuts, agréments et rapports de la fondation, à télécharger.',
  },
  {
    key: 'shop_intro',
    title: 'Boutique solidaire',
    body: 'Des produits locaux fabriqués dans le cadre de nos programmes.',
  },
  {
    key: 'promotions_intro',
    title: 'Offres du moment',
    body: 'Les offres en cours de la boutique solidaire.',
  },
  {
    key: 'engage_intro',
    title: 'S’engager',
    body: 'Faire un don, devenir bénévole ou construire un partenariat avec la fondation.',
  },
  { key: 'donate_intro', title: 'Faire un don', body: `Utilisation des fonds : ${TO_COMPLETE}` },
  { key: 'volunteer_intro', title: 'Devenir bénévole', body: TO_COMPLETE },
  { key: 'partnership_intro', title: 'Devenir partenaire', body: TO_COMPLETE },
  { key: 'news_intro', title: 'Actualités', body: 'Les actions de la fondation, datées et illustrées.' },
  {
    key: 'contact_intro',
    title: 'Contact',
    body: 'Une question, une proposition ? Écrivez-nous ou appelez-nous.',
  },
  // --- Textes juridiques : à rédiger et faire valider, jamais inventés --------
  { key: 'legal_terms', title: 'Conditions générales', body: TO_COMPLETE },
  { key: 'legal_privacy', title: 'Politique de confidentialité', body: TO_COMPLETE },
]
