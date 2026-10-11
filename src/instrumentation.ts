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
    console.error('[base] préparation impossible :', error)
  }
}
