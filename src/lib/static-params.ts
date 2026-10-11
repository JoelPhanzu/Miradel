/**
 * Avec Cache Components, generateStaticParams doit renvoyer au moins un élément.
 * Quand la liste est vide (aucun article publié…), on prérend une page « introuvable ».
 */
export function slugParams(slugs: string[]): { slug: string }[] {
  return slugs.length > 0 ? slugs.map((slug) => ({ slug })) : [{ slug: 'introuvable' }]
}
