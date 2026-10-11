import { access, constants, mkdir } from 'node:fs/promises'
import path from 'node:path'

/**
 * Sans UPLOAD_DIR, choisit un dossier de photos HORS du dossier du site
 * (sinon les photos disparaîtraient au prochain déploiement), s'il est accessible en écriture.
 */
export async function ensureUploadDir(): Promise<void> {
  if (process.env.UPLOAD_DIR) return
  const outside = path.resolve(/*turbopackIgnore: true*/ process.cwd(), '..', 'miradel-uploads')
  try {
    await mkdir(outside, { recursive: true })
    await access(outside, constants.W_OK)
    process.env.UPLOAD_DIR = outside
  } catch {
    process.env.UPLOAD_DIR = path.resolve(/*turbopackIgnore: true*/ process.cwd(), 'uploads')
    console.warn('[photos] dossier hors du site impossible, photos dans', process.env.UPLOAD_DIR)
  }
  console.log('[photos] dossier :', process.env.UPLOAD_DIR)
}
