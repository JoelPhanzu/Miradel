'use client'

import { useActionState } from 'react'
import { createFirstOwner, type SetupState } from '@/lib/auth/setup'
import { fieldClass } from './form'

export function SetupForm() {
  const [state, action, pending] = useActionState<SetupState, FormData>(createFirstOwner, {})
  const field = (id: string, label: string, props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <div className="grid gap-2">
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
      </label>
      <input id={id} name={id} required className={fieldClass} {...props} />
    </div>
  )
  return (
    <form action={action} className="grid gap-5">
      {field('code', 'Code de première connexion', {
        autoComplete: 'off',
        autoCapitalize: 'characters',
      })}
      {field('fullName', 'Votre nom', { autoComplete: 'name', defaultValue: state.fullName })}
      {field('email', 'Votre adresse e-mail (identifiant)', {
        type: 'email',
        autoComplete: 'username',
        defaultValue: state.email,
      })}
      {field('password', 'Choisissez un mot de passe (10 caractères minimum)', {
        type: 'password',
        autoComplete: 'new-password',
        minLength: 10,
      })}
      {state.error && (
        <p role="alert" className="text-accent text-sm font-semibold">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="bg-accent text-accent-ink min-h-12 rounded-full text-base font-semibold disabled:opacity-60"
      >
        {pending ? 'Création…' : 'Créer mon compte'}
      </button>
    </form>
  )
}
