/** Champ CSV sûr : guillemets doublés, et pas de formule interprétée par un tableur. */
export function csvCell(value: string): string {
  const safe = /^[=+\-@]/.test(value) ? `'${value}` : value
  return `"${safe.replace(/"/g, '""')}"`
}

/** Fichier CSV pour Excel en français : séparateur « ; », BOM UTF-8 (accents). */
export function csvResponse(rows: string[][], filename: string): Response {
  const body = rows.map((r) => r.map(csvCell).join(';')).join('\r\n')
  return new Response(`﻿${body}\r\n`, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
