import path from 'node:path'
import { readMigrationFiles } from 'drizzle-orm/migrator'
import { describe, expect, it } from 'vitest'
import { migrations } from './migrations.generated'

describe('migrations intégrées au code', () => {
  it('correspondent à db/migrations (sinon lancer « npm run db:generate »)', () => {
    const fromDisk = readMigrationFiles({
      migrationsFolder: path.join(process.cwd(), 'db', 'migrations'),
    })
    const normalize = (list: typeof migrations) =>
      list.map((m) => ({ when: m.folderMillis, sql: m.sql.map((s) => s.replace(/\r\n/g, '\n')) }))
    expect(normalize(migrations)).toEqual(normalize(fromDisk))
  })
})
