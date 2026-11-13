import type { OrganizationValue } from '@/types/content'
import { ToCompleteMark } from './ToComplete'

const GROUPS = [
  { kind: 'valeur', title: 'Nos valeurs' },
  { kind: 'principe', title: 'Nos principes d’action' },
] as const

/**
 * Valeurs et principes d'action, saisis par la fondation dans l'admin.
 * Rien n'est rédigé à sa place : tant que la liste est vide, la mention [À COMPLÉTER] s'affiche.
 */
export function ValuesSection({
  title,
  intro,
  values,
  surface = 'bg-cream-deep',
}: {
  surface?: string
  title: string
  intro?: string | null
  values: OrganizationValue[]
}) {
  const groups = GROUPS.map((g) => ({ ...g, items: values.filter((v) => v.kind === g.kind) }))

  return (
    <section className={surface}>
      <div className="mx-auto max-w-[1320px] px-4 py-16 md:px-8 md:py-24">
        <div className="max-w-[60ch]">
          <h2 className="font-display text-4xl font-bold md:text-5xl" data-reveal>
            {title}
          </h2>
          <span className="bg-orange mt-5 block h-1 w-20 rounded" aria-hidden />
          {intro && <p className="text-ink-soft mt-5 text-lg">{intro}</p>}
        </div>
        {values.length === 0 ? (
          <p className="mt-8">
            <ToCompleteMark />
          </p>
        ) : (
          <div className="mt-12 grid gap-12 lg:grid-cols-2">
            {groups
              .filter((g) => g.items.length > 0)
              .map((g) => (
                <div key={g.kind}>
                  <h3 className="text-ochre text-xs font-bold tracking-[0.2em] uppercase">
                    {g.title}
                  </h3>
                  <ol className="mt-5 grid gap-4 sm:grid-cols-2">
                    {g.items.map((v, i) => (
                      <li
                        key={v.id}
                        data-reveal
                        className="bg-cream border-line flex flex-col rounded-2xl border p-6 shadow-sm"
                      >
                        <span className="font-display text-accent text-3xl font-extrabold">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span className="font-display mt-3 text-xl font-bold">{v.title}</span>
                        {v.description && (
                          <span className="text-ink-soft mt-2">{v.description}</span>
                        )}
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
          </div>
        )}
      </div>
    </section>
  )
}
