import { getPageSections } from '@/lib/data/public'
import { IMAGES } from '@/content/images'
import { PageHeader } from './PageHeader'
import { RichText } from './ToComplete'

/**
 * Texte juridique saisi dans l'admin (Textes et images du site).
 * Aucun texte n'est inventé : tant qu'il n'est pas fourni et validé, « [À COMPLÉTER] » s'affiche.
 */
export async function LegalPage({
  sectionKey,
  fallbackTitle,
}: {
  sectionKey: string
  fallbackTitle: string
}) {
  const section = (await getPageSections())[sectionKey]
  return (
    <>
      <PageHeader
        title={section?.title ?? fallbackTitle}
        imageUrl={section?.imageUrl}
        image={IMAGES.pages.legal}
      />
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-20">
        <div className="max-w-[72ch]">
          <RichText text={section?.body} />
        </div>
      </div>
    </>
  )
}
