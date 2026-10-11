'use client'

import { useEffect, useState } from 'react'
import { HONEYPOT_FIELD, STARTED_AT_FIELD } from '@/lib/antispam'

/** Heure d'affichage du formulaire (délai minimal avant envoi), fixée après le chargement. */
export function useStartedAt(): number {
  const [startedAt, setStartedAt] = useState(0)
  useEffect(() => {
    // Date.now() n'est pas disponible au rendu serveur : lecture après montage.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStartedAt(Date.now())
  }, [])
  return startedAt
}

/** Champ piège invisible : un humain ne le voit pas et ne le remplit pas. */
export function Honeypot() {
  return (
    <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label>
        Ne pas remplir
        <input type="text" name={HONEYPOT_FIELD} tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  )
}

/** Champs anti-robot à joindre à l'envoi JSON. */
export function antiSpamPayload(form: FormData, startedAt: number) {
  return {
    [HONEYPOT_FIELD]: String(form.get(HONEYPOT_FIELD) ?? ''),
    [STARTED_AT_FIELD]: startedAt,
  }
}
