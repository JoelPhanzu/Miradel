/** Sections éditables du site, avec un nom compréhensible et les champs utilisés. */
type Field = 'title' | 'body' | 'imageUrl' | 'secondaryImageUrl' | 'button'

const EMPHASIS_HELP = 'Entourez un mot d’astérisques pour l’écrire en italique : « les *jeunes* ».'
const MARKDOWN_HELP =
  'Paragraphes séparés par une ligne vide. « ## » pour un titre, « - » pour une liste, **gras**.'

export const PAGE_SECTIONS: {
  key: string
  label: string
  page: string
  fields: Field[]
  help?: string
}[] = [
  {
    key: 'home_hero',
    label: 'Bandeau principal',
    page: 'Accueil',
    fields: ['title', 'body', 'imageUrl', 'button'],
    help: `${EMPHASIS_HELP} Photo réelle uniquement, avec l’accord des personnes photographiées.`,
  },
  {
    key: 'home_mission',
    label: 'Mission',
    page: 'Accueil',
    fields: ['title', 'body', 'imageUrl', 'button'],
  },
  {
    key: 'home_programs',
    label: 'Section programmes',
    page: 'Accueil',
    fields: ['title', 'body', 'button'],
  },
  { key: 'home_impact', label: 'Section impact', page: 'Accueil', fields: ['title', 'button'] },
  {
    key: 'home_shop',
    label: 'Section boutique',
    page: 'Accueil',
    fields: ['title', 'body', 'button'],
  },
  { key: 'home_news', label: 'Section actualités', page: 'Accueil', fields: ['title', 'button'] },
  {
    key: 'home_cta',
    label: 'Appel à s’engager (bas de page)',
    page: 'Accueil',
    fields: ['title', 'body', 'button'],
  },
  {
    key: 'foundation_intro',
    label: 'Introduction',
    page: 'La Fondation',
    fields: ['title', 'body', 'imageUrl'],
  },
  {
    key: 'foundation_history',
    label: 'Histoire',
    page: 'La Fondation',
    fields: ['title', 'body', 'imageUrl'],
    help: MARKDOWN_HELP,
  },
  {
    key: 'foundation_governance',
    label: 'Gouvernance',
    page: 'La Fondation',
    fields: ['title', 'body'],
    help: MARKDOWN_HELP,
  },
  { key: 'foundation_team', label: 'Titre équipe', page: 'La Fondation', fields: ['title'] },
  {
    key: 'foundation_partners',
    label: 'Titre partenaires',
    page: 'La Fondation',
    fields: ['title'],
  },
  { key: 'programs_intro', label: 'Introduction', page: 'Nos programmes', fields: ['title', 'body'] },
  { key: 'impact_intro', label: 'Introduction', page: 'Notre impact', fields: ['title', 'body'] },
  {
    key: 'transparency_intro',
    label: 'Introduction',
    page: 'Transparence',
    fields: ['title', 'body'],
  },
  { key: 'shop_intro', label: 'Introduction', page: 'Boutique', fields: ['title', 'body'] },
  {
    key: 'promotions_intro',
    label: 'Introduction',
    page: 'Offres du moment',
    fields: ['title', 'body'],
  },
  { key: 'engage_intro', label: 'Introduction', page: 'S’engager', fields: ['title', 'body'] },
  {
    key: 'donate_intro',
    label: 'Utilisation des dons',
    page: 'Faire un don',
    fields: ['title', 'body'],
    help: `Expliquez à quoi servent les dons. Ne promettez aucun reçu fiscal. ${MARKDOWN_HELP}`,
  },
  {
    key: 'volunteer_intro',
    label: 'Bénévolat',
    page: 'S’engager',
    fields: ['title', 'body'],
  },
  {
    key: 'partnership_intro',
    label: 'Partenariat',
    page: 'S’engager',
    fields: ['title', 'body'],
  },
  { key: 'news_intro', label: 'Introduction', page: 'Actualités', fields: ['title', 'body'] },
  { key: 'contact_intro', label: 'Introduction', page: 'Contact', fields: ['title', 'body'] },
  {
    key: 'legal_terms',
    label: 'Texte complet',
    page: 'Conditions générales',
    fields: ['title', 'body'],
    help: `Texte juridique à faire valider avant publication. ${MARKDOWN_HELP}`,
  },
  {
    key: 'legal_privacy',
    label: 'Texte complet',
    page: 'Politique de confidentialité',
    fields: ['title', 'body'],
    help: `Texte juridique à faire valider avant publication. ${MARKDOWN_HELP}`,
  },
]
