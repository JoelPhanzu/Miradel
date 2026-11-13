import Link from 'next/link'

/** Logo texte provisoire : le logo officiel de la fondation reste à fournir. */
export function Logo({ onDark }: { onDark?: boolean }) {
  return (
    <Link
      href="/"
      className="group flex min-h-11 shrink-0 flex-col justify-center leading-none"
      aria-label="Fondation MIRADEL FEVEPA, accueil"
    >
      <span
        className={`text-[0.55rem] font-bold tracking-[0.3em] uppercase sm:text-[0.6rem] ${onDark ? 'text-orange-400' : 'text-orange-700'}`}
      >
        Fondation
      </span>
      <span
        className={`font-display mt-0.5 text-[1.3rem] font-extrabold tracking-tight sm:text-[1.55rem] ${onDark ? 'text-white' : 'text-navy-900'}`}
      >
        MIRADEL
      </span>
      <span
        className={`text-[0.55rem] font-bold tracking-[0.3em] uppercase sm:text-[0.6rem] ${onDark ? 'text-white/80' : 'text-ink-500'}`}
      >
        Fevepa
      </span>
    </Link>
  )
}
