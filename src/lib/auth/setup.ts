'use server'

import bcrypt from 'bcryptjs'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { getDb, isDatabaseConfigured, schema } from '@/db'
import { isBlocked, recordFailure } from '@/lib/rate-limit'
import { createSession } from './session'

/**
 * Création du tout premier compte (responsable de la fondation), une seule fois.
 * Protégée par un code remis par Lean Market ; seule son empreinte bcrypt est dans le code source.
 * Peut être remplacée par la variable d'environnement SETUP_CODE_HASH.
 * Dès qu'un compte existe, cette création est impossible.
 */
const SETUP_CODE_HASH =
  process.env.SETUP_CODE_HASH ?? '$2b$12$Khqzq8Fv6qlBAad3D18oougefb4SuHYxELgk6qiBvHsCYhGKrG6S2'

export interface SetupState {
  error?: string
  /** Valeurs ressaisies après une erreur (jamais le code ni le mot de passe). */
  fullName?: string
  email?: string
}

const setupSchema = z.object({
  code: z.string().trim().toUpperCase(),
  fullName: z.string().trim().min(2, 'Indiquez votre nom'),
  email: z.string().trim().toLowerCase().email('Adresse e-mail invalide'),
  password: z.string().min(10, 'Mot de passe : 10 caractères minimum').max(200),
})

export async function createFirstOwner(_state: SetupState, fd: FormData): Promise<SetupState> {
  if (!isDatabaseConfigured()) return { error: 'La base de données n’est pas configurée.' }
  const ip = (await headers()).get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'inconnue'
  const key = `setup:${ip}`
  if (isBlocked(key, 5, 30 * 60_000)) {
    return { error: 'Trop de tentatives. Réessayez plus tard.' }
  }

  const keep = { fullName: String(fd.get('fullName') ?? ''), email: String(fd.get('email') ?? '') }
  const parsed = setupSchema.safeParse(Object.fromEntries(fd))
  if (!parsed.success) return { ...keep, error: parsed.error.issues[0].message }
  const { code, fullName, email, password } = parsed.data

  if (!(await bcrypt.compare(code, SETUP_CODE_HASH))) {
    recordFailure(key)
    return { ...keep, error: 'Code de première connexion incorrect.' }
  }

  const db = getDb()
  const existing = await db.select({ id: schema.users.id }).from(schema.users).limit(1)
  if (existing.length > 0) redirect('/admin/connexion')

  const id = crypto.randomUUID()
  await db.insert(schema.users).values({
    id,
    email,
    fullName,
    passwordHash: await bcrypt.hash(password, 12),
    role: 'owner',
  })
  await createSession(id)
  redirect('/admin')
}
