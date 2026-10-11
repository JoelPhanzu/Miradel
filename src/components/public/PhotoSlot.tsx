import Image from 'next/image'

interface PhotoSlotProps {
  /** URL de la photo réelle. Tant qu'elle manque, un emplacement décrit la photo attendue. */
  src?: string | null
  alt: string
  /** Description de la photo à fournir, visible sur l'emplacement vide. */
  brief: string
  className?: string
  sizes?: string
  priority?: boolean
}

export function PhotoSlot({ src, alt, brief, className = '', sizes, priority }: PhotoSlotProps) {
  // Ne pas écraser un positionnement absolu passé par l'appelant.
  const position = className.split(/\s+/).includes('absolute') ? '' : 'relative'

  if (src) {
    return (
      <div className={`${position} overflow-hidden ${className}`}>
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes ?? '100vw'}
          priority={priority}
          className="object-cover"
        />
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
