import 'server-only'
import { asc, eq } from 'drizzle-orm'
import type { MySqlColumn, MySqlTable } from 'drizzle-orm/mysql-core'
import { getDb } from '@/db'

type OrderedTable = MySqlTable & { id: MySqlColumn; position: MySqlColumn }

/**
 * Monte ou descend un élément d'un cran. Renumérote toute la liste (0, 1, 2…)
 * pour corriger d'éventuelles positions en double.
 */
export async function moveItem(
  table: OrderedTable,
  id: string,
  direction: 'up' | 'down',
): Promise<boolean> {
  const db = getDb()
  const rows = (await db
    .select({ id: table.id, position: table.position })
    .from(table)
    .orderBy(asc(table.position))) as { id: string; position: number }[]

  const index = rows.findIndex((r) => r.id === id)
  const target = direction === 'up' ? index - 1 : index + 1
  if (index < 0 || target < 0 || target >= rows.length) return false

  const ordered = [...rows]
  ;[ordered[index], ordered[target]] = [ordered[target], ordered[index]]

  await db.transaction(async (tx) => {
    for (const [position, row] of ordered.entries()) {
      if (row.position !== position) {
        await tx
          .update(table)
          .set({ position } as never)
          .where(eq(table.id, row.id))
      }
    }
  })
  return true
}

/** Position d'un nouvel élément : à la fin de la liste. */
export async function nextPosition(table: OrderedTable): Promise<number> {
  const rows = await getDb().select({ position: table.position }).from(table)
  return rows.reduce((max, r) => Math.max(max, Number(r.position) + 1), 0)
}
