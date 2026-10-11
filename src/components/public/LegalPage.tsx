import { getPageSections } from '@/lib/data/public'
import { PageHeader } from './PageHeader'
import { RichText } from './ToComplete'

/**
 * Texte juridique saisi dans l'admin (Textes et images du site).
 * Aucun texte n'est inventé : tant qu'il n'est pas fourni et validé, « [À COMPLÉTER] » s'affiche.
 */
export async function LegalPage({ sectionKey, fallbackTitle }: { sectionKey: string; fallbackTitle: string }) {
  const section = (await getPageSections())[sectionKey]
  return (
    <>
      <PageHeader title={section?.title ?? fallbackTitle} />
      <div className="mx-auto max-w-[1320px] px-4 pb-24 md:px-8">
        <div className="max-w-[72ch]">
          <RichText text={section?.body} />
        </div>
      </div>
    </>
  )
}
