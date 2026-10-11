'use server'

import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { getDb, isDatabaseConfigured, schema } from '@/db'
import { isBlocked, recordFailure } from '@/lib/rate-limit'
import { createSession, destroySession } from './session'

export interface LoginState {
  error?: string
  email?: string
}

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1).max(200),
})

// Empreinte factice : le temps de réponse ne révèle pas si l'adresse existe.
let dummyHash: string | null = null
const getDummyHash = () => (dummyHash ??= bcrypt.hashSync('miradel-factice', 12))

export async function login(_state: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })
  const email = String(formData.get('email') ?? '')
  if (!parsed.success) return { error: 'Adresse e-mail ou mot de passe incorrect.', email }
  if (!isDatabaseConfigured()) return { error: 'La base de données n’est pas configurée.', email }

  const ip = (await headers()).get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'inconnue'
  const WINDOW = 15 * 60_000
  const ipKey = `login-ip:${ip}`
  const emailKey = `login-email:${parsed.data.email}`
  if (isBlocked(ipKey, 20, WINDOW) || isBlocked(emailKey, 8, WINDOW)) {
    return { error: 'Trop de tentatives. Réessayez dans 15 minutes.', email }
  }

  const db = getDb()
  const [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, parsed.data.email))
  const valid = await bcrypt.compare(parsed.data.password, user?.passwordHash ?? getDummyHash())
  if (!user || !valid || !user.isActive) {
    recordFailure(ipKey)
    recordFailure(emailKey)
    return { error: 'Adresse e-mail ou mot de passe incorrect.', email }
  }

  await db.update(schema.users).set({ lastLoginAt: new Date() }).where(eq(schema.users.id, user.id))
  await createSession(user.id)
  redirect('/admin')
}

export async function logout(): Promise<void> {
  await destroySession()
  redirect('/admin/connexion')
}
