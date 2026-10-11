/**
 * Remplit une base vide (usage local ; en production, le site le fait seul au démarrage)
 * et crée un compte administrateur si SEED_OWNER_* est renseigné.
 *
 *   npm run db:migrate && npm run db:seed
 */
import bcrypt from 'bcryptjs'
import { drizzle } from 'drizzle-orm/mysql2'
import mysql from 'mysql2/promise'
import * as schema from '../src/db/schema'
import { seedContentIfEmpty } from '../src/db/seed-content'

const url = process.env.DATABASE_URL
if (!url) throw new Error('DATABASE_URL manquante')

const pool = mysql.createPool({ uri: url, timezone: 'Z', connectionLimit: 1 })
const db = drizzle(pool, { schema, mode: 'default' })

async function main() {
  console.log(
    (await seedContentIfEmpty(db))
      ? 'Contenus de départ ajoutés.'
      : 'La base contient déjà des données.',
  )

  const email = process.env.SEED_OWNER_EMAIL?.trim().toLowerCase()
  const password = process.env.SEED_OWNER_PASSWORD
  if (!email || !password) return
  if (password.length < 10) throw new Error('SEED_OWNER_PASSWORD : 10 caractères minimum')
  const existing = await db.select({ id: schema.users.id }).from(schema.users).limit(1)
  if (existing.length > 0) {
    console.log('Un compte administrateur existe déjà.')
    return
  }
  await db.insert(schema.users).values({
    email,
    fullName: process.env.SEED_OWNER_NAME?.trim() || 'Responsable',
    passwordHash: await bcrypt.hash(password, 12),
    role: 'owner',
  })
  console.log(`Compte administrateur créé : ${email}`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => pool.end())
