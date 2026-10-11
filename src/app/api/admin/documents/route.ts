import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/session'
import {
  ALLOWED_DOCUMENT_TYPES,
  MAX_DOCUMENT_BYTES,
  MEDIA_URL_PREFIX,
  resolveUploadPath,
} from '@/lib/server/uploads'

/** Envoi d'un PDF depuis l'admin (Transparence). Renvoie son adresse et sa taille. */
export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Connexion requise' }, { status: 401 })

  const form = await request.formData().catch(() => null)
  const file = form?.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Aucun fichier reçu' }, { status: 400 })
  }
  if (file.size > MAX_DOCUMENT_BYTES) {
    return NextResponse.json({ error: 'Fichier trop lourd (10 Mo maximum)' }, { status: 413 })
  }

  const bytes = new Uint8Array(await file.arrayBuffer())
  // Signature d'un PDF : « %PDF- » (on ne se fie pas au type annoncé par le navigateur).
  if (String.fromCharCode(...bytes.subarray(0, 5)) !== '%PDF-') {
    return NextResponse.json({ error: 'Format non accepté (PDF uniquement)' }, { status: 415 })
  }

  const now = new Date()
  const folder = `documents/${now.getUTCFullYear()}`
  const relative = `${folder}/${crypto.randomUUID()}.${ALLOWED_DOCUMENT_TYPES['application/pdf']}`
  const absolute = resolveUploadPath(relative)
  if (!absolute) return NextResponse.json({ error: 'Chemin invalide' }, { status: 400 })

  await mkdir(path.dirname(absolute), { recursive: true })
  await writeFile(absolute, bytes)

  return NextResponse.json(
    { url: `${MEDIA_URL_PREFIX}${relative}`, sizeBytes: bytes.byteLength },
    { status: 201 },
  )
}
