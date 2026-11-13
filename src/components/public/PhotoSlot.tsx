import Image from 'next/image'
import type { StockImage } from '@/content/images'

interface PhotoSlotProps {
  /** URL de la photo réelle (saisie dans l'admin). */
  src?: string | null
  alt: string
  /** Description de la photo à fournir, visible sur l'emplacement vide. */
  brief: string
  /** Photo d'illustration provisoire (src/content/images.ts) quand la vraie manque. */
  fallback?: StockImage
  className?: string
  /** Classes de l'image elle-même (agrandissement au survol, cadrage…). */
  imageClassName?: string
  sizes?: string
  /** Image principale de la page (bandeau) : préchargée. */
  priority?: boolean
}

/** Mention discrète posée sur les photos d'illustration provisoires. */
export function IllustrationNote({ className = '' }: { className?: string }) {
  return (
    <span
      className={`bg-navy-950/70 pointer-events-none absolute z-10 rounded px-1.5 py-0.5 text-[0.65rem] leading-tight font-medium text-white/90 ${className}`}
    >
      Photo d’illustration
    </span>
  )
}

export function PhotoSlot({
  src,
  alt,
  brief,
  fallback,
  className = '',
  imageClassName = '',
  sizes,
  priority,
}: PhotoSlotProps) {
  // Ne pas écraser un positionnement absolu passé par l'appelant.
  const position = className.split(/\s+/).includes('absolute') ? '' : 'relative'
  const image = src ? { src, alt, position: undefined } : fallback

  if (image) {
    return (
      <div className={`${position} overflow-hidden ${className}`}>
        <Image
          src={image.src}
          alt={src ? alt : image.alt}
          fill
          sizes={sizes ?? '100vw'}
          preload={priority}
          className={`object-cover ${image.position ?? ''} ${imageClassName}`}
        />
        {!src && <IllustrationNote className="right-2 bottom-2" />}
      </div>
    )
  }

  return (
    <div
      role="img"
      aria-label={alt}
      className={`photo-slot ${position} flex items-start overflow-hidden ${className}`}
    >
      <p className="bg-ink/80 text-cream m-3 max-w-[30ch] px-2.5 py-1.5 text-[0.72rem] leading-snug">
        Photo à fournir : {brief}
      </p>
    </div>
  )
}
