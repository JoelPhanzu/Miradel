/**
 * Préparation automatique de la base au démarrage du serveur :
 * applique les migrations puis, si la base est vide, les contenus de départ.
 * Aucune commande à lancer à la main sur Hostinger.
 *
 * Les migrations viennent de migrations.generated.ts (et non du dossier db/migrations,
 * absent du dossier de build Hostinger). Même table de suivi que drizzle-kit
 * (__drizzle_migrations) : « npm run db:migrate » et le démarrage restent compatibles.
 */
import { lt, sql } from 'drizzle-orm'
import type { MigrationConfig, MigrationMeta } from 'drizzle-orm/migrator'
import { getDb, schema, type Database } from './index'
import { migrations } from './migrations.generated'
import { seedContentIfEmpty } from './seed-content'

/** Accès au moteur de migration interne de drizzle (celui qu'utilise drizzle-orm/mysql2/migrator). */
interface MigratableDatabase {
  dialect: { migrate(m: MigrationMeta[], session: unknown, config: MigrationConfig): Promise<void> }
  session: unknown
}

/** Tables créées par les migrations (lues dans leur SQL). */
const migrationTables = [
  ...new Set(
    migrations.flatMap((m) =>
      m.sql.flatMap((s) => [...s.matchAll(/CREATE TABLE `(\w+)`/g)].map((r) => r[1])),
    ),
  ),
]

/**
 * Si aucune migration n'a jamais abouti mais que des tables existent déjà
 * (installation interrompue), elles empêcheraient la création. On les supprime,
 * uniquement si elles sont vides : aucune donnée ne peut être perdue.
 */
async function dropLeftoversOfFailedInstall(db: Database): Promise<void> {
  const [tracked] = (await db.execute(
    sql`select count(*) as n from information_schema.tables
        where table_schema = database() and table_name = '__drizzle_migrations'`,
  )) as unknown as [{ n: number }[]]
  if (Number(tracked[0].n) > 0) {
    const [done] = (await db.execute(
      sql`select count(*) as n from __drizzle_migrations`,
    )) as unknown as [{ n: number }[]]
    if (Number(done[0].n) > 0) return
  }

  const [rows] = (await db.execute(
    sql`select table_name as name from information_schema.tables where table_schema = database()`,
  )) as unknown as [{ name: string }[]]
  const leftovers = rows.map((r) => r.name).filter((name) => migrationTables.includes(name))
  for (const name of leftovers) {
    const [count] = (await db.execute(
      sql`select count(*) as n from ${sql.identifier(name)}`,
    )) as unknown as [{ n: number }[]]
    if (Number(count[0].n) > 0) {
      throw new Error(`La table ${name} existe déjà et contient des données : rien n'est supprimé.`)
    }
  }
  if (leftovers.length === 0) return
  // Même connexion pour tout (foreign_key_checks est propre à la connexion).
  await db.transaction(async (tx) => {
    await tx.execute(sql`set foreign_key_checks = 0`)
    try {
      for (const name of leftovers) await tx.execute(sql`drop table ${sql.identifier(name)}`)
    } finally {
      await tx.execute(sql`set foreign_key_checks = 1`)
    }
  })
  console.log(
    '[base] tables vides d’une installation interrompue supprimées :',
    leftovers.join(', '),
  )
}

export async function ensureDatabase(): Promise<void> {
  const db = getDb()
  await dropLeftoversOfFailedInstall(db)
  const internal = db as Database & MigratableDatabase
  await internal.dialect.migrate(migrations, internal.session, { migrationsFolder: '' })
  const seeded = await seedContentIfEmpty(db)
  // Base limitée à 2 Go : les sessions et liens expirés ne sont pas gardés.
  const now = new Date()
  await db.delete(schema.sessions).where(lt(schema.sessions.expiresAt, now))
  await db.delete(schema.passwordResets).where(lt(schema.passwordResets.expiresAt, now))
  console.log(
    seeded ? '[base] tables créées et contenus de départ ajoutés' : '[base] tables à jour',
  )
}
