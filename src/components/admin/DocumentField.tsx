'use client'

import { FilePdf } from '@phosphor-icons/react'
import { useId, useState } from 'react'
import { formatFileSize } from '@/lib/format'
import { useFieldError } from './form'

const MAX_BYTES = 10 * 1024 * 1024
const WARN_BYTES = 3 * 1024 * 1024

/** Envoi d'un PDF (10 Mo max, avertissement au-delà de 3 Mo pour les visiteurs en données mobiles). */
export function DocumentField({
  defaultUrl,
  defaultSize,
}: {
  defaultUrl?: string | null
  defaultSize?: number | null
}) {
  const id = useId()
  const [url, setUrl] = useState(defaultUrl ?? '')
  const [size, setSize] = useState(defaultSize ?? 0)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fieldError = useFieldError('fileUrl')

  async function upload(file: File) {
    setError(null)
    if (file.size > MAX_BYTES) {
      setError('Fichier trop lourd : 10 Mo maximum. Compressez le PDF avant de l’envoyer.')
      return
    }
    setBusy(true)
    try {
      const body = new FormData()
      body.append('file', file)
      const response = await fetch('/api/admin/documents', { method: 'POST', body })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error ?? 'Envoi impossible')
      setUrl(result.url)
      setSize(result.sizeBytes)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Envoi impossible. Vérifiez la connexion.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid gap-2" data-uploading={busy}>
      <span className="text-sm font-semibold">Fichier PDF</span>
      <input type="hidden" name="fileUrl" value={url} />
      <input type="hidden" name="fileSizeBytes" value={size} />
      {url && (
        <a
          href={url}
          target="_blank"
          className="border-line flex min-h-14 items-center gap-3 rounded-2xl border px-4"
        >
          <FilePdf size={28} className="text-accent shrink-0" aria-hidden />
          <span className="font-semibold">PDF envoyé ({formatFileSize(size)})</span>
        </a>
      )}
      <label
        htmlFor={id}
        className="border-ink/40 inline-flex min-h-12 w-fit cursor-pointer items-center justify-center rounded-full border px-5 text-sm font-semibold"
      >
        {busy ? 'Envoi…' : url ? 'Remplacer le PDF' : 'Choisir un PDF'}
      </label>
      <input
        id={id}
        type="file"
        accept="application/pdf"
        className="sr-only"
        disabled={busy}
        onChange={async (e) => {
          const file = e.target.files?.[0]
          if (file) await upload(file)
          e.target.value = ''
        }}
      />
      {size > WARN_BYTES && !error && (
        <p className="text-accent text-sm font-semibold">
          Fichier lourd ({formatFileSize(size)}) : long à télécharger en données mobiles. Si
          possible, envoyez une version compressée.
        </p>
      )}
      {(error || fieldError) && (
        <p className="text-accent text-sm font-semibold">{error ?? fieldError}</p>
      )}
    </div>
  )
}
