import { readFile } from 'node:fs/promises'
import { ALLOWED_DOCUMENT_TYPES, ALLOWED_IMAGE_TYPES, resolveUploadPath } from '@/lib/server/uploads'

const CONTENT_TYPES = Object.fromEntries(
  Object.entries({ ...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES }).map(([type, ext]) => [
    ext,
    type,
  ]),
)

/** Sert les images et les PDF envoyés depuis l'admin (noms uniques : mise en cache longue). */
export async function GET(_request: Request, { params }: RouteContext<'/media/[...path]'>) {
  const { path } = await params
  const file = resolveUploadPath(path.join('/'))
  const contentType = CONTENT_TYPES[path.at(-1)?.split('.').pop()?.toLowerCase() ?? '']
  if (!file || !contentType) return new Response('Introuvable', { status: 404 })

  try {
    const data = await readFile(file)
    return new Response(new Uint8Array(data), {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch {
    return new Response('Introuvable', { status: 404 })
  }
}
