import type { Metadata } from 'next'
import { DownloadSimple, FilePdf } from '@phosphor-icons/react/ssr'
import { IdentityCard } from '@/components/public/IdentityCard'
import { PageHeader } from '@/components/public/PageHeader'
import { ToCompleteMark } from '@/components/public/ToComplete'
import { DOCUMENT_TYPES } from '@/db/schema'
import { DOCUMENT_TYPE_LABELS } from '@/lib/admin/labels'
import { getPageSections, getPublishedDocuments, getSiteSettings } from '@/lib/data/public'
import { formatFileSize } from '@/lib/format'

export const metadata: Metadata = {
  title: 'Transparence',
  description:
    'Statuts, agréments, rapports d’activité et rapports financiers de la Fondation MIRADEL FEVEPA.',
}

const container = 'mx-auto max-w-[1320px] px-4 md:px-8'

const GROUP_TITLES: Record<(typeof DOCUMENT_TYPES)[number], string> = {
  statuts: 'Statuts',
  agrement: 'Agréments',
  rapport_activite: 'Rapports d’activité',
  rapport_financier: 'Rapports financiers',
  autre: 'Autres documents',
}

export default async function TransparencyPage() {
  const [{ transparency_intro: intro }, settings, documents] = await Promise.all([
    getPageSections(),
    getSiteSettings(),
    getPublishedDocuments(),
  ])
  const groups = DOCUMENT_TYPES.map((type) => ({
    type,
    docs: documents.filter((d) => d.type === type),
  })).filter((g) => g.docs.length > 0)

  return (
    <>
      <PageHeader title={intro?.title ?? 'Transparence'} intro={intro?.body} />

      <div className={`${container} grid gap-16 pb-24 lg:grid-cols-[1fr_1.3fr] lg:gap-20`}>
        <section>
          <h2 className="font-display text-3xl font-medium">Identité de la fondation</h2>
          <div className="mt-6">
            <IdentityCard settings={settings} />
          </div>
        </section>

        <section>
          <h2 className="font-display text-3xl font-medium">Documents</h2>
          {groups.length === 0 ? (
            <p className="mt-6">
              Statuts, agréments et rapports : <ToCompleteMark />
            </p>
          ) : (
            <div className="mt-6 grid gap-10">
              {groups.map(({ type, docs }) => (
                <div key={type}>
                  <h3 className="text-ochre text-xs font-semibold tracking-[0.14em] uppercase">
                    {GROUP_TITLES[type]}
                  </h3>
                  <ul className="divide-line border-line mt-3 divide-y border-y">
                    {docs.map((doc) => (
                      <li key={doc.id}>
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noopener"
                          className="hover:bg-cream-deep flex min-h-16 items-center gap-4 py-4 transition-colors md:px-2"
                        >
                          <FilePdf size={32} className="text-accent shrink-0" aria-hidden />
                          <span className="min-w-0 grow">
                            <span className="block font-semibold">{doc.title}</span>
                            <span className="text-ink-soft block text-sm">
                              {DOCUMENT_TYPE_LABELS[doc.type]}
                              {doc.year ? ` · ${doc.year}` : ''} · PDF,{' '}
                              {formatFileSize(doc.fileSizeBytes)}
                            </span>
                            {doc.description && (
                              <span className="text-ink-soft mt-1 block text-sm">
                                {doc.description}
                              </span>
                            )}
                          </span>
                          <DownloadSimple size={22} className="shrink-0" aria-hidden />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  )
}
