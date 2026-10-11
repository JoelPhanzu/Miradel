'use client'

import { useRouter } from 'next/navigation'
import { ArrowDown, ArrowUp } from '@phosphor-icons/react'
import { useTransition } from 'react'

/** Flèches pour changer l'ordre d'affichage (plus fiable que le glisser-déposer sur téléphone). */
export function MoveButtons({
  onMove,
  first,
  last,
  label,
}: {
  onMove: (direction: 'up' | 'down') => Promise<unknown>
  first: boolean
  last: boolean
  label: string
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const move = (direction: 'up' | 'down') =>
    startTransition(async () => {
      await onMove(direction)
      router.refresh()
    })

  return (
    <div className={`flex shrink-0 flex-col ${pending ? 'opacity-50' : ''}`}>
      <button
        type="button"
        disabled={first || pending}
        onClick={() => move('up')}
        className="flex size-9 items-center justify-center disabled:opacity-25"
        aria-label={`Monter ${label}`}
      >
        <ArrowUp size={18} aria-hidden />
      </button>
      <button
        type="button"
        disabled={last || pending}
        onClick={() => move('down')}
        className="flex size-9 items-center justify-center disabled:opacity-25"
        aria-label={`Descendre ${label}`}
      >
        <ArrowDown size={18} aria-hidden />
      </button>
    </div>
  )
}
