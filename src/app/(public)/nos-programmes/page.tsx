import type { Metadata } from 'next'
import { ProgramCard } from '@/components/public/cards'
import { PageHeader } from '@/components/public/PageHeader'
import { getPageSections, getPublishedPrograms } from '@/lib/data/public'

export const metadata: Metadata = {
  title: 'Nos programmes',
  description:
    'Agriculture durable, santé communautaire, éducation inclusive, protection environnementale : les programmes de la Fondation MIRADEL FEVEPA.',
}

export default async function ProgramsPage() {
  const [{ programs_intro: intro }, programs] = await Promise.all([
    getPageSections(),
    getPublishedPrograms(),
  ])
  return (
    <>
      <PageHeader title={intro?.title ?? 'Nos programmes'} intro={intro?.body} />
      <div className="mx-auto max-w-[1320px] px-4 pb-24 md:px-8">
        {programs.length === 0 ? (
          <p className="text-ink-soft">Les programmes seront présentés ici prochainement.</p>
        ) : (
          <ul className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {programs.map((program, i) => (
              <li key={program.id} data-reveal>
                <ProgramCard program={program} priority={i < 2} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}
