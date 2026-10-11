import 'server-only'
import { drizzle, type MySql2Database } from 'drizzle-orm/mysql2'
import mysql from 'mysql2/promise'
import * as schema from './schema'

export type Database = MySql2Database<typeof schema>

declare global {
  // Réutilise le pool entre les rechargements à chaud en développement.
  var __miradelPool: mysql.Pool | undefined
}

/** Vrai si la base est configurée (DATABASE_URL). Sinon le site public utilise les contenus de repli. */
export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL)
}

let instance: Database | null = null

/**
 * Sur Hostinger, MySQL n'écoute que sur 127.0.0.1 : « localhost » (résolu en ::1 par Node)
 * échoue. On corrige ici pour que DATABASE_URL fonctionne avec l'un comme l'autre.
 */
export function normalizeDatabaseUrl(raw: string): string {
  const url = new URL(raw)
  if (url.hostname === 'localhost') url.hostname = '127.0.0.1'
  return url.toString()
}

export function getDb(): Database {
  if (instance) return instance
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL manquante : voir .env.example')
  const pool =
    globalThis.__miradelPool ??
    mysql.createPool({
      uri: normalizeDatabaseUrl(url),
      // Les dates sont stockées en UTC ; l'affichage se fait à l'heure de Kinshasa.
      timezone: 'Z',
      connectionLimit: 5,
      connectTimeout: 5_000,
      enableKeepAlive: true,
    })
  if (process.env.NODE_ENV !== 'production') globalThis.__miradelPool = pool
  instance = drizzle(pool, { schema, mode: 'default' })
  return instance
}

export { schema }
