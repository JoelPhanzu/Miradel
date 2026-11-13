import { asc } from 'drizzle-orm'
import { getDb, schema } from '@/db'
import { getCurrentUser } from '@/lib/auth/session'
import { csvCell } from '@/lib/csv'
import { kinshasaDateString } from '@/lib/dates'

/** Export CSV des abonnés actifs (séparateur « ; » pour Excel en français). */
export async function GET() {
  const user = await getCurrentUser()
  if (!user) return new Response('Connexion requise', { status: 401 })

  const rows = await getDb()
    .select()
    .from(schema.newsletterSubscribers)
    .orderBy(asc(schema.newsletterSubscribers.createdAt))
  const lines = [
    ['email', 'date_inscription'].join(';'),
    ...rows
      .filter((r) => r.consent && !r.unsubscribedAt)
      .map((r) => [csvCell(r.email), csvCell(kinshasaDateString(r.createdAt))].join(';')),
  ]
  // BOM : Excel reconnaît l'UTF-8 (accents).
  return new Response(`﻿${lines.join('\r\n')}\r\n`, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="abonnes-miradel-${kinshasaDateString(new Date())}.csv"`,
      'Cache-Control': 'no-store',
    },
  })
}
