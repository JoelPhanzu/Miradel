/** Exécuté une fois au démarrage du serveur Next.js. */
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return
  // Pas pendant le build : uniquement quand le site démarre réellement.
  if (process.env.NEXT_PHASE === 'phase-production-build') return

  console.log(`[démarrage] environnement : ${process.env.APP_ENV ?? 'non précisé'}`)

  if (process.env.NODE_ENV === 'production') {
    const { ensureUploadDir } = await import('./lib/server/ensure-upload-dir')
    await ensureUploadDir()
  }
  if (!process.env.DATABASE_URL) return

  const { ensureDatabase } = await import('./db/bootstrap')
  try {
    await ensureDatabase()
  } catch (error) {
    // Le site démarre quand même ; l'erreur apparaît dans les journaux Hostinger.
    console.error('[base] préparation impossible :', describeDbError(error))
  }
}

/**
 * Drizzle enveloppe l'erreur MySQL (« Failed query… ») et le journal Hostinger n'en montre pas
 * la cause : on affiche le code et le message de mysql2, sans aucun secret.
 */
function describeDbError(error: unknown): string {
  const e = error as { message?: string; cause?: { code?: string; message?: string } }
  const cause = e?.cause
  if (!cause) return String(e?.message ?? error)
  return `${cause.code ?? 'INCONNU'} — ${cause.message ?? ''} (requête : ${e.message?.split('\n')[0]})`
}
