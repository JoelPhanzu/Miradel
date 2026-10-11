/**
 * Outils communs des actions de l'admin : lecture des formulaires, slugs uniques,
 * journal des modifications et rafraîchissement des pages publiques.
 */
import 'server-only'
import { and, eq, ne } from 'drizzle-orm'
import type { MySqlColumn, MySqlTable } from 'drizzle-orm/mysql-core'
import { revalidatePath, updateTag } from 'next/cache'
import { getDb, schema } from '@/db'
import type { CacheTag } from '@/lib/data/public'
import { slugify } from '@/lib/slug'

import type { ActionState } from './types'

export type { ActionState }

export const success = (message = 'Enregistré', id?: string): ActionState => ({
  ok: true,
  message,
  id,
})
export const failure = (
  errors: Record<string, string>,
  message = 'Vérifiez les champs signalés.',
): ActionState => ({
  ok: false,
  message,
  errors,
})

export function zodErrors(
  issues: { path: PropertyKey[]; message: string }[],
): Record<string, string> {
  const errors: Record<string, string> = {}
  for (const issue of issues) errors[String(issue.path[0] ?? 'form')] ??= issue.message
  return errors
}

// --- Lecture des champs ------------------------------------------------------

export const text = (fd: FormData, key: string) => String(fd.get(key) ?? '').trim()
export const optionalText = (fd: FormData, key: string) => text(fd, key) || null
export const checked = (fd: FormData, key: string) => fd.get(key) === 'on'

export function optionalInt(fd: FormData, key: string): number | null {
  const raw = text(fd, key).replace(/[\s  ]/g, '')
  if (!raw) return null
  const value = Number(raw)
  return Number.isFinite(value) ? Math.round(value) : null
}

/**
 * Montant saisi dans la devise choisie : « 5 000 » FC -> 5000 ; « 12,50 » USD -> 1250 (cents).
 * null si le champ est vide, NaN si la saisie est invalide.
 */
export function optionalMoney(fd: FormData, key: string, currency: 'CDF' | 'USD'): number | null {
  const raw = text(fd, key).replace(/[\s  ]/g, '').replace(',', '.')
  if (!raw) return null
  const value = Number(raw)
  if (!Number.isFinite(value) || value < 0) return Number.NaN
  return currency === 'USD' ? Math.round(value * 100) : Math.round(value)
}

/** Devise d'un formulaire (FC par défaut). */
export const currencyField = (fd: FormData, key = 'currency'): 'CDF' | 'USD' =>
  text(fd, key) === 'USD' ? 'USD' : 'CDF'

export function jsonField<T>(fd: FormData, key: string, fallback: T): T {
  try {
    const raw = text(fd, key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

// --- Slugs uniques ----------------------------------------------------------

export async function uniqueSlug(
  table: MySqlTable & { slug: MySqlColumn; id: MySqlColumn },
  source: string,
  excludeId?: string,
): Promise<string> {
  const db = getDb()
  const base = slugify(source)
  for (let i = 1; i < 50; i++) {
    const candidate = i === 1 ? base : `${base}-${i}`
    const condition = excludeId
      ? and(eq(table.slug, candidate), ne(table.id, excludeId))
      : eq(table.slug, candidate)
    const existing = await db.select({ id: table.id }).from(table).where(condition).limit(1)
    if (existing.length === 0) return candidate
  }
  return `${base}-${crypto.randomUUID().slice(0, 6)}`
}

// --- Journal et rafraîchissement --------------------------------------------

export async function audit(
  tableName: string,
  recordId: string | null,
  action: 'INSERT' | 'UPDATE' | 'DELETE',
  userId: string,
  oldValues: Record<string, unknown> | null,
  newValues: Record<string, unknown> | null,
): Promise<void> {
  try {
    await getDb()
      .insert(schema.auditLog)
      .values({ tableName, recordId, action, userId, oldValues, newValues })
  } catch (error) {
    // Le journal ne doit jamais bloquer un enregistrement.
    console.error('[journal] écriture impossible', error)
  }
}

/** Rend la modification visible immédiatement sur le site et dans l'admin. */
export function refresh(tags: CacheTag[], adminPath?: string): void {
  for (const tag of tags) updateTag(tag)
  // Les pages pré-rendues gardent une copie des données (reprise PPR) : sans cela, la première
  // visite après un enregistrement montrerait encore l'ancienne version.
  revalidatePath('/', 'layout')
  if (adminPath) revalidatePath(adminPath)
}
