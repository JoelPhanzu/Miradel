'use client'

import { useActionState } from 'react'
import { login, type LoginState } from '@/lib/auth/actions'
import { fieldClass } from './form'

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {})
  return (
    <form action={action} className="grid gap-5">
      <div className="grid gap-2">
        <label htmlFor="email" className="text-sm font-semibold">
          Adresse e-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          defaultValue={state.email}
          className={fieldClass}
        />
      </div>
      <div className="grid gap-2">
        <label htmlFor="password" className="text-sm font-semibold">
          Mot de passe
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={fieldClass}
        />
      </div>
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
        {pending ? 'Connexion…' : 'Se connecter'}
      </button>
      <p className="text-ink-soft text-sm">
        Mot de passe oublié ? Demandez à Lean Market ou à la responsable de le réinitialiser depuis
        l’écran Utilisateurs.
      </p>
    </form>
  )
}
