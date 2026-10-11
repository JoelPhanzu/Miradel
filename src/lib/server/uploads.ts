import 'server-only'
import path from 'node:path'

/** Dossier persistant des images (hors du dossier de l'application en production). */
export function uploadRoot(): string {
  // Dossier choisi à l'exécution : rien à inclure dans le build.
  return path.resolve(/*turbopackIgnore: true*/ process.env.UPLOAD_DIR ?? './uploads')
}

/** Chemin absolu d'un fichier, ou null s'il sortirait du dossier (tentative de « ../ »). */
export function resolveUploadPath(relative: string): string | null {
  const root = uploadRoot()
  const absolute = path.resolve(/*turbopackIgnore: true*/ root, relative)
  return absolute.startsWith(root + path.sep) ? absolute : null
}

export const MEDIA_URL_PREFIX = '/media/'

export const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  'image/webp': 'webp',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/avif': 'avif',
}

export const MAX_UPLOAD_BYTES = 3 * 1024 * 1024

/** Documents de transparence (statuts, rapports) : PDF uniquement, 10 Mo maximum. */
export const ALLOWED_DOCUMENT_TYPES: Record<string, string> = { 'application/pdf': 'pdf' }
export const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024
