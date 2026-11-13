import { connection } from 'next/server'
import { Suspense } from 'react'
import { CalendarBlank } from '@phosphor-icons/react/ssr'
import { formatDeadline } from '@/lib/dates'
import { getPublishedProgramForms } from '@/lib/data/public'
import { isFormOpen } from '@/lib/program-forms'
import { ProgramFormView } from './form/ProgramFormView'
import { SimpleMarkdown } from './SimpleMarkdown'

/**
 * Formulaires de participation d'un programme. La date limite est vérifiée à chaque visite :
 * passé ce moment, le formulaire n'est plus affiché (un avis « inscriptions closes » le remplace)
 * et le serveur refuse les envois.
 */
async function FormsContent({ programId }: { programId: string }) {
  await connection()
  const now = new Date()
  const forms = (await getPublishedProgramForms()).filter((f) => f.programId === programId)
  if (forms.length === 0) return null
  const open = forms.filter((f) => isFormOpen(f, now))
  const closed = forms.filter((f) => !isFormOpen(f, now))

  return (
    <section id="participer" className="bg-accent-soft scroll-mt-28">
      <div className="mx-auto grid max-w-[1320px] gap-16 px-4 py-16 md:px-8 md:py-20">
        {open.map((form) => (
          <div key={form.id} className="grid gap-10 md:grid-cols-[0.8fr_1.2fr] md:gap-16">
            <div>
              <p className="text-ochre text-xs font-semibold tracking-[0.2em] uppercase">
                Participer
              </p>
              <h2 className="font-display mt-3 text-4xl font-semibold md:text-5xl">{form.title}</h2>
              <p className="bg-cream mt-5 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold">
                <CalendarBlank size={18} aria-hidden />
                Jusqu’au {formatDeadline(form.closesAt!)}
              </p>
              {form.intro && (
                <div className="text-ink-soft mt-6">
                  <SimpleMarkdown text={form.intro} />
                </div>
              )}
            </div>
            <div className="bg-cream rounded-3xl p-5 shadow-sm md:p-8">
              <ProgramFormView
                formId={form.id}
                fields={form.fields}
                successMessage={form.successMessage}
              />
            </div>
          </div>
        ))}
        {open.length === 0 && (
          <ul className="grid gap-2">
            {closed.map((form) => (
              <li key={form.id} className="text-ink-soft">
                <strong className="text-ink">{form.title}</strong> : inscriptions closes
                {form.closesAt ? ` depuis le ${formatDeadline(form.closesAt)}` : ''}.
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

export function ProgramForms({ programId }: { programId: string }) {
  return (
    <Suspense fallback={null}>
      <FormsContent programId={programId} />
    </Suspense>
  )
}
