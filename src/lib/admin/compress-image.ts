/**
 * Compression dans le navigateur avant envoi : largeur max 1600 px, WebP, ~200 Ko.
 * Économise les données mobiles de l'équipe.
 */
const MAX_SIDE = 1600
const TARGET_BYTES = 220 * 1024

export interface CompressedImage {
  blob: Blob
  width: number
  height: number
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Image illisible'))
    }
    img.src = url
  })
}

function toBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', quality))
}

export async function compressImage(file: File): Promise<CompressedImage> {
  const img = await loadImage(file)
  const scale = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight))
  const width = Math.round(img.naturalWidth * scale)
  const height = Math.round(img.naturalHeight * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Compression impossible sur cet appareil')
  context.drawImage(img, 0, 0, width, height)

  let quality = 0.85
  let blob = await toBlob(canvas, quality)
  while (blob && blob.size > TARGET_BYTES && quality > 0.5) {
    quality -= 0.1
    blob = await toBlob(canvas, quality)
  }
  // Navigateur sans encodeur WebP : on garde le fichier d'origine s'il n'est pas trop lourd.
  if (!blob || blob.type !== 'image/webp') return { blob: file, width, height }
  return { blob, width, height }
}

export async function uploadImage(file: File): Promise<string> {
  const { blob, width, height } = await compressImage(file)
  const body = new FormData()
  body.append('file', blob, blob.type === 'image/webp' ? 'image.webp' : file.name)
  body.append('width', String(width))
  body.append('height', String(height))
  const response = await fetch('/api/admin/media', { method: 'POST', body })
  const result = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(result.error ?? 'Envoi impossible')
  return result.url as string
}
