import type { Metadata } from 'next'
import { Kicker } from '@/components/public/cards'
import { DownloadSimple, FilePdf } from '@phosphor-icons/react/ssr'
import { IdentityCard } from '@/components/public/IdentityCard'
import { PageHeader } from '@/components/public/PageHeader'
import { ToCompleteMark } from '@/components/public/ToComplete'
import { DOCUMENT_TYPES } from '@/db/schema'
import { DOCUMENT_TYPE_LABELS } from '@/lib/admin/labels'
import { IMAGES } from '@/content/images'
import { getPageSections, getPublishedDocuments, getSiteSettings } from '@/lib/data/public'
import { formatFileSize } from '@/lib/format'

export const metadata: Metadata = {
  title: 'Transparence',
  description:
    'Statuts, agréments, rapports d’activité et rapports financiers de la Fondation MIRADEL FEVEPA.',
}

const container = 'mx-auto max-w-7xl px-4 sm:px-6'

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
      <PageHeader
        title={intro?.title ?? 'Transparence'}
        intro={intro?.body}
        imageUrl={intro?.imageUrl}
        image={IMAGES.pages.transparence}
      />

      <div className={`${container} grid gap-16 py-14 md:py-20 lg:grid-cols-[1fr_1.3fr] lg:gap-20`}>
        <section>
          <Kicker className="mb-3" />
          <h2 className="font-display text-heading text-2xl font-extrabold md:text-3xl">
            Identité de la fondation
          </h2>
          <div className="mt-6">
            <IdentityCard settings={settings} />
          </div>
        </section>

        <section>
          <Kicker className="mb-3" />
          <h2 className="font-display text-heading text-2xl font-extrabold md:text-3xl">
            Documents
          </h2>
          {groups.length === 0 ? (
            <p className="mt-6">
              Statuts, agréments et rapports : <ToCompleteMark />
            </p>
          ) : (
            <div className="mt-6 grid gap-10">
              {groups.map(({ type, docs }) => (
                <div key={type}>
                  <h3 className="text-ochre text-xs font-bold tracking-[0.14em] uppercase">
                    {GROUP_TITLES[type]}
                  </h3>
                  <ul className="divide-line border-line mt-3 divide-y border-y">
                    {docs.map((doc) => (
                      <li key={doc.id}>
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noopener"
                          className="flex min-h-16 items-center gap-4 rounded-lg px-2 py-4 transition-colors hover:bg-gray-50"
                        >
                          <FilePdf
                            size={32}
                            weight="duotone"
                            className="shrink-0 text-orange-500"
                            aria-hidden
                          />
                          <span className="min-w-0 grow">
                            <span className="text-heading block font-bold break-words">
                              {doc.title}
                            </span>
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
                          <DownloadSimple
                            size={22}
                            weight="bold"
                            className="text-navy-800 shrink-0"
                            aria-hidden
                          />
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
