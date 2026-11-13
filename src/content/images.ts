/**
 * Photos d'illustration PROVISOIRES (Unsplash, licence gratuite), centralisées ici.
 *
 * Elles ne s'affichent que là où la fondation n'a pas encore fourni de photo dans l'admin :
 * dès qu'une vraie photo est enregistrée, c'est elle qui l'emporte. Chacune porte la mention
 * « Photo d'illustration » à l'écran pour ne jamais faire passer un inconnu pour un bénéficiaire.
 * Pour remplacer une image : changer son `src` ici (ou saisir la vraie photo dans l'admin).
 * Liste suivie dans docs/a-completer.md.
 */

export interface StockImage {
  src: string
  alt: string
  /** Cadrage sur mobile si le sujet n'est pas centré (classe Tailwind object-*). */
  position?: string
}

const unsplash = (id: string, width = 1600) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=80`

export const IMAGES = {
  hero: {
    src: unsplash('1790943780822-9918073fe9f1', 2000),
    alt: 'Deux femmes en tenue de wax travaillent un tissu près d’une machine à coudre, dans un atelier de couture',
    position: 'object-[center_30%] md:object-right',
  },
  mission: {
    src: unsplash('1632215861513-130b66fe97f4', 1200),
    alt: 'Une jeune femme lit son manuel debout dans une salle de classe, entourée d’élèves',
  },
  ctaBand: {
    src: unsplash('1710149484964-d966b771c204'),
    alt: 'Les mains d’une femme en pagne laissent couler une poignée de grains de riz',
  },
  programs: {
    agriculture: {
      src: unsplash('1509099381441-ea3c0cf98b94', 1200),
      alt: 'Une femme plante des boutures de manioc dans un champ, d’autres cultivatrices à l’arrière-plan',
    },
    sante: {
      src: unsplash('1678695972687-033fa0bdbac9', 1200),
      alt: 'Une jeune soignante souriante en blouse blanche, un stéthoscope autour du cou',
      position: 'object-top',
    },
    education: {
      src: unsplash('1744809482817-9a9d4fc280af', 1200),
      alt: 'Un enseignant donne un cours au tableau, vu depuis le fond de la classe',
    },
    environnement: {
      src: unsplash('1590682680695-43b964a3ae17', 1200),
      alt: 'Des mains couvertes de terre plantent une jeune pousse',
    },
    autre: {
      src: unsplash('1710149484964-d966b771c204', 1200),
      alt: 'Les mains d’une femme en pagne laissent couler une poignée de grains de riz',
    },
  },
  pages: {
    fondation: {
      src: unsplash('1790943780822-9918073fe9f1', 2000),
      alt: 'Deux femmes en tenue de wax travaillent un tissu dans un atelier de couture',
      position: 'object-[center_30%]',
    },
    programmes: {
      src: unsplash('1509099381441-ea3c0cf98b94', 2000),
      alt: 'Cultivatrices au travail dans un champ de manioc',
    },
    impact: {
      src: unsplash('1632215861513-130b66fe97f4', 2000),
      alt: 'Élèves lisant leurs manuels dans une salle de classe',
    },
    transparence: {
      src: unsplash('1562240020-ce31ccb0fa7d', 2000),
      alt: 'Une pile de documents imprimés',
    },
    vitrine: {
      src: unsplash('1778079247396-9c0e01c83c8b', 2000),
      alt: 'Une vendeuse trie des piments séchés étalés sur une bâche, sur un marché en plein air',
    },
    produits: {
      src: unsplash('1781080922537-7d5338f96e95', 2000),
      alt: 'Assortiment de savons artisanaux de différentes couleurs',
    },
    panier: {
      src: unsplash('1488459716781-31db52582fe9', 2000),
      alt: 'Étal de fruits frais sur un marché',
    },
    promotions: {
      src: unsplash('1778079247396-9c0e01c83c8b', 2000),
      alt: 'Piments séchés étalés sur un marché en plein air',
    },
    actualites: {
      src: unsplash('1744809482817-9a9d4fc280af', 2000),
      alt: 'Un enseignant donne un cours au tableau devant ses élèves',
    },
    contact: {
      src: unsplash('1633960719106-894ffd8b34d2', 2000),
      alt: 'La ville de Kinshasa vue depuis le fleuve Congo, sous un ciel bleu',
    },
    sengager: {
      src: unsplash('1582213782179-e0d53f98f2ca', 2000),
      alt: 'Plusieurs mains posées les unes sur les autres en signe d’engagement commun',
    },
    don: {
      src: unsplash('1469571486292-0ba58a3f068b', 2000),
      alt: 'Des mains jointes formant un cœur peint en rouge',
    },
    legal: {
      src: unsplash('1562240020-ce31ccb0fa7d', 2000),
      alt: 'Une pile de documents imprimés',
    },
  },
} as const satisfies {
  hero: StockImage
  mission: StockImage
  ctaBand: StockImage
  programs: Record<string, StockImage>
  pages: Record<string, StockImage>
}

/** Photo d'illustration d'un programme, choisie d'après son intitulé. */
export function programImage(slugOrTitle: string): StockImage {
  const s = slugOrTitle.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  if (/agri|culture|champ|elevage|agro/.test(s)) return IMAGES.programs.agriculture
  if (/sante|clinique|medic|hygiene/.test(s)) return IMAGES.programs.sante
  if (/educ|ecole|scola|formation|alphab/.test(s)) return IMAGES.programs.education
  if (/environ|vert|climat|arbre|reboise/.test(s)) return IMAGES.programs.environnement
  return IMAGES.programs.autre
}
