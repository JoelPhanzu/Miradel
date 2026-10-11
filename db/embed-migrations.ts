/**
 * Copie les migrations SQL (db/migrations) dans src/db/migrations.generated.ts.
 * Hostinger lance le site depuis un dossier de build qui ne contient pas db/migrations :
 * les migrations doivent donc faire partie du code compilé.
 * Lancé automatiquement par « npm run db:generate ».
 */
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { readMigrationFiles } from 'drizzle-orm/migrator'

const migrationsFolder = path.join(process.cwd(), 'db', 'migrations')
const output = path.join(process.cwd(), 'src', 'db', 'migrations.generated.ts')

// Fins de ligne normalisées : le résultat est identique sous Windows et sous Linux.
const migrations = readMigrationFiles({ migrationsFolder }).map((m) => ({
  ...m,
  sql: m.sql.map((s) => s.replace(/\r\n/g, '\n')),
}))

const content = `// Fichier généré par db/embed-migrations.ts (npm run db:generate). Ne pas modifier à la main.
import type { MigrationMeta } from 'drizzle-orm/migrator'

export const migrations: MigrationMeta[] = ${JSON.stringify(migrations, null, 2)}
`

const previous = (() => {
  try {
    return readFileSync(output, 'utf8')
  } catch {
    return ''
  }
})()
if (previous !== content) writeFileSync(output, content)
console.log(
  `${migrations.length} migration(s) intégrée(s) dans ${path.relative(process.cwd(), output)}`,
)
