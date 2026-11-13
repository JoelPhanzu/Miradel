import Link from 'next/link'
import { ArrowRight } from '@phosphor-icons/react/ssr'
import type { ComponentProps } from 'react'

type Variant = 'primary' | 'secondary' | 'outline' | 'whatsapp' | 'onDark'

const variants: Record<Variant, string> = {
  primary: 'bg-orange-500 text-navy-950 hover:bg-orange-400',
  secondary: 'bg-navy-800 text-white hover:bg-navy-700',
  outline: 'border-2 border-navy-800 text-navy-800 hover:bg-navy-800 hover:text-white',
  whatsapp: 'bg-whatsapp text-navy-950 hover:brightness-105',
  onDark: 'border-2 border-white text-white hover:bg-white hover:text-navy-900',
}

interface ButtonLinkProps extends ComponentProps<typeof Link> {
  variant?: Variant
  /** Flèche à droite du libellé (par défaut sur les boutons principaux et secondaires). */
  arrow?: boolean
}

/**
 * Bouton-lien en pilule : icône à gauche (passée dans children), flèche à droite.
 * Zone tactile ≥ 44 px ; le libellé passe à la ligne plutôt que de déborder.
 */
export function ButtonLink({
  variant = 'primary',
  arrow,
  className = '',
  children,
  ...props
}: ButtonLinkProps) {
  const showArrow = arrow ?? (variant === 'primary' || variant === 'secondary')
  return (
    <Link
      {...props}
      className={`group/btn inline-flex min-h-12 max-w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-center text-sm leading-tight font-bold transition duration-300 active:scale-[0.98] ${variants[variant]} ${className}`}
    >
      {children}
      {showArrow && (
        <ArrowRight
          size={16}
          weight="bold"
          className="shrink-0 transition-transform group-hover/btn:translate-x-0.5"
          aria-hidden
        />
      )}
    </Link>
  )
}
