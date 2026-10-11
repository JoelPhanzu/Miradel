import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import { Suspense } from 'react'
import { LoginForm } from '@/components/admin/LoginForm'
import { SetupForm } from '@/components/admin/SetupForm'
import { getDb, isDatabaseConfigured, schema } from '@/db'
import { getCurrentUser } from '@/lib/auth/session'

export const metadata: Metadata = {
  title: 'Connexion',
  robots: { index: false, follow: false },
}

/** Connexion, ou création du premier compte si aucun n'existe encore. */
async function Content() {
  await connection()
  if (!isDatabaseConfigured()) {
    return <p className="text-ink-soft">La base de données n’est pas encore reliée au site.</p>
  }
  let loggedIn: boolean
  let hasUsers: boolean
  try {
    loggedIn = Boolean(await getCurrentUser())
    const users = await getDb().select({ id: schema.users.id }).from(schema.users).limit(1)
    hasUsers = users.length > 0
  } catch (error) {
    console.error('[connexion] base injoignable :', error)
    return <DatabaseError code={errorCode(error)} />
  }
  if (loggedIn) redirect('/admin')

  if (!hasUsers) {
    return (
      <>
        <p className="mb-6">
          Bienvenue ! Créez le compte de la responsable avec le code de première connexion remis par
          Lean Market.
        </p>
        <SetupForm />
      </>
    )
  }
  return <LoginForm />
}

/** Code MySQL de l'erreur (ex. ECONNREFUSED, ER_ACCESS_DENIED_ERROR), sans aucun secret. */
function errorCode(error: unknown): string {
  const e = error as { code?: unknown; cause?: { code?: unknown } }
  const code = e?.cause?.code ?? e?.code
  return typeof code === 'string' ? code : 'INCONNU'
}

const HINTS: Record<string, string> = {
  ECONNREFUSED:
    'Le serveur MySQL refuse la connexion : vérifiez l’hôte (essayez 127.0.0.1 au lieu de localhost) et le port.',
  ENOTFOUND: 'Hôte MySQL introuvable : vérifiez l’hôte dans DATABASE_URL.',
  ETIMEDOUT: 'Le serveur MySQL ne répond pas : vérifiez l’hôte dans DATABASE_URL.',
  ER_ACCESS_DENIED_ERROR: 'Utilisateur ou mot de passe MySQL refusé : vérifiez DATABASE_URL.',
  ER_BAD_DB_ERROR: 'Nom de base inconnu : vérifiez la fin de DATABASE_URL.',
  ER_NO_SUCH_TABLE: 'Les tables n’ont pas été créées : consultez les journaux du démarrage.',
}

function DatabaseError({ code }: { code: string }) {
  return (
    <div role="alert" className="grid gap-2">
      <p className="text-accent font-semibold">La base de données est injoignable.</p>
      <p className="text-ink-soft text-sm">{HINTS[code] ?? 'Consultez les journaux du serveur.'}</p>
      <p className="text-ink-soft text-xs">Code : {code}</p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <p className="font-display text-4xl font-semibold">MIRADEL</p>
        <p className="text-ink-soft mt-1">Espace de gestion de la fondation</p>
        <div className="mt-10">
          <Suspense fallback={<div className="bg-cream-deep h-64 animate-pulse rounded-3xl" />}>
            <Content />
          </Suspense>
        </div>
      </div>
    </main>
  )
}
