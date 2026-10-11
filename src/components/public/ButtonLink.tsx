import Link from 'next/link'
import type { ComponentProps } from 'react'

type Variant = 'primary' | 'outline' | 'whatsapp'

const variants: Record<Variant, string> = {
  primary: 'bg-accent text-accent-ink hover:bg-ink hover:text-cream',
  outline: 'border border-ink/70 text-ink hover:bg-ink hover:text-cream',
  whatsapp: 'bg-whatsapp text-white hover:brightness-110 dark:text-[#10261a]',
}

interface ButtonLinkProps extends ComponentProps<typeof Link> {
  variant?: Variant
}

/** Bouton-lien en pilule, zone tactile d'au moins 44 px. */
export function ButtonLink({ variant = 'primary', className = '', ...props }: ButtonLinkProps) {
  return (
    <Link
      {...props}
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold whitespace-nowrap transition duration-300 active:scale-[0.98] ${variants[variant]} ${className}`}
    />
  )
}
