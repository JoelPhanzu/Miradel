import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { NextResponse } from 'next/server'
import { getDb, schema } from '@/db'
import { getCurrentUser } from '@/lib/auth/session'
import {
  ALLOWED_IMAGE_TYPES,
  MAX_UPLOAD_BYTES,
  MEDIA_URL_PREFIX,
  resolveUploadPath,
} from '@/lib/server/uploads'

/** Vérifie la signature du fichier (on ne se fie pas au type annoncé par le navigateur). */
function sniffImageType(bytes: Uint8Array): string | null {
  const ascii = (start: number, length: number) =>
    String.fromCharCode(...bytes.subarray(start, start + length))
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg'
  if (ascii(1, 3) === 'PNG') return 'image/png'
  if (ascii(0, 4) === 'RIFF' && ascii(8, 4) === 'WEBP') return 'image/webp'
  if (ascii(4, 4) === 'ftyp' && ascii(8, 4).startsWith('avi')) return 'image/avif'
  return null
}

/** Envoi d'une image depuis l'admin (déjà compressée en WebP par le navigateur). */
export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Connexion requise' }, { status: 401 })

  const form = await request.formData().catch(() => null)
  const file = form?.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Aucun fichier reçu' }, { status: 400 })
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: 'Image trop lourde (3 Mo maximum)' }, { status: 413 })
  }

  const bytes = new Uint8Array(await file.arrayBuffer())
  const type = sniffImageType(bytes)
  if (!type || !ALLOWED_IMAGE_TYPES[type]) {
    return NextResponse.json({ error: 'Format non accepté (JPEG, PNG, WebP)' }, { status: 415 })
  }

  const now = new Date()
  const folder = `${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, '0')}`
  const relative = `${folder}/${crypto.randomUUID()}.${ALLOWED_IMAGE_TYPES[type]}`
  const absolute = resolveUploadPath(relative)
  if (!absolute) return NextResponse.json({ error: 'Chemin invalide' }, { status: 400 })

  await mkdir(path.dirname(absolute), { recursive: true })
  await writeFile(absolute, bytes)

  const width = Number(form?.get('width')) || null
  const height = Number(form?.get('height')) || null
  await getDb().insert(schema.media).values({
    path: relative,
    mimeType: type,
    width,
    height,
    sizeBytes: bytes.byteLength,
  })

  return NextResponse.json({ url: `${MEDIA_URL_PREFIX}${relative}` }, { status: 201 })
}
