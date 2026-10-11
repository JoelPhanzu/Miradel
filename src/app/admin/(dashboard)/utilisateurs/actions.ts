'use server'

import bcrypt from 'bcryptjs'
import { and, eq, ne } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { getDb, schema } from '@/db'
import { audit, checked, failure, success, text, type ActionState } from '@/lib/admin/server'
import { MANAGER_ROLES, requireUser, type Role } from '@/lib/auth/session'

const ROLES: Role[] = ['owner', 'editor', 'lean_admin']
const MIN_PASSWORD = 10

/** Création / modification d'un compte (responsable et Lean Market uniquement). */
export async function saveUser(
  id: string | null,
  _state: ActionState,
  fd: FormData,
): Promise<ActionState> {
  const me = await requireUser(MANAGER_ROLES)
  const errors: Record<string, string> = {}

  const fullName = text(fd, 'fullName')
  if (!fullName) errors.fullName = 'Indiquez le nom'
  const email = text(fd, 'email').toLowerCase()
  if (!z.email().safeParse(email).success) errors.email = 'Adresse e-mail invalide'
  const role = text(fd, 'role') as Role
  if (!ROLES.includes(role)) errors.role = 'Choisissez un rôle'
  const isActive = id ? checked(fd, 'isActive') : true
  const password = text(fd, 'password')
  if ((!id || password) && password.length < MIN_PASSWORD) {
    errors.password = `${MIN_PASSWORD} caractères minimum`
  }
  if (id === me.id && (!isActive || role !== me.role)) {
    errors.role = 'Vous ne pouvez pas modifier votre propre rôle ni désactiver votre compte'
  }

  const db = getDb()
  const [duplicate] = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(
      id
        ? and(eq(schema.users.email, email), ne(schema.users.id, id))
        : eq(schema.users.email, email),
    )
  if (duplicate) errors.email = 'Cette adresse est déjà utilisée'
  if (Object.keys(errors).length) return failure(errors)

  const values = { fullName, email, role, isActive }
  if (id) {
    await db
      .update(schema.users)
      .set({ ...values, ...(password ? { passwordHash: await bcrypt.hash(password, 12) } : {}) })
      .where(eq(schema.users.id, id))
    // Mot de passe réinitialisé ou compte désactivé : on déconnecte ses appareils.
    if (password || !isActive)
      await db.delete(schema.sessions).where(eq(schema.sessions.userId, id))
    await audit('users', id, 'UPDATE', me.id, null, {
      ...values,
      passwordChanged: Boolean(password),
    })
    revalidatePath('/admin/utilisateurs')
    return success(
      password ? 'Enregistré. Communiquez le nouveau mot de passe à la personne.' : 'Enregistré',
    )
  }

  const newId = crypto.randomUUID()
  await db
    .insert(schema.users)
    .values({ ...values, id: newId, passwordHash: await bcrypt.hash(password, 12) })
  await audit('users', newId, 'INSERT', me.id, null, values)
  revalidatePath('/admin/utilisateurs')
  return success('Compte créé', newId)
}

/** Mon compte : nom et mot de passe (l'ancien mot de passe est demandé). */
export async function saveMyAccount(_state: ActionState, fd: FormData): Promise<ActionState> {
  const me = await requireUser()
  const fullName = text(fd, 'fullName')
  if (!fullName) return failure({ fullName: 'Indiquez votre nom' })

  const current = text(fd, 'currentPassword')
  const next = text(fd, 'newPassword')
  const db = getDb()
  const update: { fullName: string; passwordHash?: string } = { fullName }

  if (next) {
    if (next.length < MIN_PASSWORD)
      return failure({ newPassword: `${MIN_PASSWORD} caractères minimum` })
    const [user] = await db.select().from(schema.users).where(eq(schema.users.id, me.id))
    if (!user || !(await bcrypt.compare(current, user.passwordHash))) {
      return failure({ currentPassword: 'Mot de passe actuel incorrect' })
    }
    update.passwordHash = await bcrypt.hash(next, 12)
  }

  await db.update(schema.users).set(update).where(eq(schema.users.id, me.id))
  await audit('users', me.id, 'UPDATE', me.id, null, { fullName, passwordChanged: Boolean(next) })
  revalidatePath('/admin', 'layout')
  return success(next ? 'Mot de passe modifié' : 'Enregistré')
}
