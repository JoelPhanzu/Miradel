'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import type { ActionState } from '@/lib/admin/types'

/** Changement de statut en un geste. */
export function StatusButtons<S extends string>({
  statuses,
  current,
  onChange,
  labels,
}: {
  statuses: readonly S[]
  current: S
  onChange: (status: S) => Promise<ActionState>
  labels?: Partial<Record<S, string>>
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Statut">
        {statuses.map((status) => {
          const active = status === current
          return (
            <button
              key={status}
              type="button"
              disabled={pending || active}
              aria-pressed={active}
              onClick={() =>
                startTransition(async () => {
                  setError(null)
                  try {
                    const result = await onChange(status)
                    if (!result.ok) setError(result.message ?? 'Modification impossible')
                    router.refresh()
                  } catch {
                    setError('Connexion perdue. Réessayez.')
                  }
                })
              }
              className={`min-h-12 rounded-full border px-5 text-sm font-semibold capitalize transition ${
                active ? 'bg-ink text-cream border-ink' : 'border-ink/30 hover:border-ink'
              } ${pending && !active ? 'opacity-50' : ''}`}
            >
              {labels?.[status] ?? status}
            </button>
          )
        })}
      </div>
      {error && <p className="text-accent mt-2 text-sm font-semibold">{error}</p>}
    </div>
  )
}
