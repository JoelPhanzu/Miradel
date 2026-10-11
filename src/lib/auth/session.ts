/**
 * Sessions de l'administration, stockées en base.
 * Le cookie contient un jeton aléatoire ; la base n'en garde que l'empreinte SHA-256.
 */
import 'server-only'
import { createHash, randomBytes } from 'node:crypto'
import { and, eq, gt } from 'drizzle-orm'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import { getDb, isDatabaseConfigured, schema } from '@/db'

const COOKIE_NAME = 'miradel_admin'
// Session longue : l'équipe travaille surtout depuis son téléphone.
const SESSION_DAYS = 30
const RENEW_BELOW_DAYS = 15

export type Role = 'owner' | 'editor' | 'lean_admin'

export interface AdminUser {
  id: string
  email: string
  fullName: string
  role: Role
}

const hashToken = (token: string) => createHash('sha256').update(token).digest('hex')
const daysFromNow = (days: number) => new Date(Date.now() + days * 24 * 60 * 60 * 1000)

export async function createSession(userId: string): Promise<void> {
  const token = randomBytes(32).toString('base64url')
  const expiresAt = daysFromNow(SESSION_DAYS)
  await getDb()
    .insert(schema.sessions)
    .values({ id: hashToken(token), userId, expiresAt })
  ;(await cookies()).set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: expiresAt,
  })
}

export async function destroySession(): Promise<void> {
  const store = await cookies()
  const token = store.get(COOKIE_NAME)?.value
  if (token) {
    await getDb()
      .delete(schema.sessions)
      .where(eq(schema.sessions.id, hashToken(token)))
  }
  store.delete(COOKIE_NAME)
}

/** Utilisateur connecté, ou null. Prolonge la session si elle approche de l'expiration. */
export async function getCurrentUser(): Promise<AdminUser | null> {
  // Lecture du cookie d'abord : la page reste rendue à la requête, jamais prérendue.
  const token = (await cookies()).get(COOKIE_NAME)?.value
  if (!token || !isDatabaseConfigured()) return null
  // Rendu à la requête : la validité de la session dépend de l'heure.
  await connection()

  const db = getDb()
  const id = hashToken(token)
  const [row] = await db
    .select({
      expiresAt: schema.sessions.expiresAt,
      id: schema.users.id,
      email: schema.users.email,
      fullName: schema.users.fullName,
      role: schema.users.role,
    })
    .from(schema.sessions)
    .innerJoin(schema.users, eq(schema.sessions.userId, schema.users.id))
    .where(
      and(
        eq(schema.sessions.id, id),
        gt(schema.sessions.expiresAt, new Date()),
        eq(schema.users.isActive, true),
      ),
    )
  if (!row) return null

  if (row.expiresAt < daysFromNow(RENEW_BELOW_DAYS)) {
    await db
      .update(schema.sessions)
      .set({ expiresAt: daysFromNow(SESSION_DAYS) })
      .where(eq(schema.sessions.id, id))
  }

  return { id: row.id, email: row.email, fullName: row.fullName, role: row.role }
}

/** Exige une connexion (et éventuellement un rôle) ; sinon renvoie vers la page de connexion. */
export async function requireUser(roles?: Role[]): Promise<AdminUser> {
  const user = await getCurrentUser()
  if (!user) redirect('/admin/connexion')
  if (roles && !roles.includes(user.role)) redirect('/admin')
  return user
}

export const MANAGER_ROLES: Role[] = ['owner', 'lean_admin']
