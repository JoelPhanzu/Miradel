import Link from 'next/link'

/** Logo texte provisoire : le logo officiel de la fondation reste à fournir. */
export function Logo() {
  return (
    <Link
      href="/"
      className="group flex flex-col leading-none"
      aria-label="Fondation MIRADEL FEVEPA, accueil"
    >
      <span className="text-ochre text-[0.6rem] font-semibold tracking-[0.3em] uppercase">
        Fondation
      </span>
      <span className="font-display mt-0.5 text-[1.55rem] font-semibold tracking-tight">
        MIRADEL
      </span>
      <span className="text-ink-soft text-[0.6rem] font-semibold tracking-[0.3em] uppercase">
        Fevepa
      </span>
    </Link>
  )
}
