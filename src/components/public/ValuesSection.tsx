import {
  Eye,
  GraduationCap,
  HandHeart,
  Handshake,
  Leaf,
  Lightbulb,
  MapPin,
  Medal,
  Scales,
  SealCheck,
  ShieldCheck,
  Target,
  TrendUp,
  UsersThree,
  CheckCircle,
} from '@phosphor-icons/react/ssr'
import type { OrganizationValue } from '@/types/content'
import { Emphasis } from './Emphasis'
import { ToCompleteMark } from './ToComplete'

const GROUPS = [
  { kind: 'valeur', title: 'Nos valeurs' },
  { kind: 'principe', title: 'Nos principes d’action' },
] as const

/** Icône au trait fin choisie d'après l'intitulé (sans rien ajouter au texte de la fondation). */
const ICONS: [RegExp, typeof SealCheck][] = [
  [/transparen|redevab|honnet/, Eye],
  [/integr|ethique|confian/, ShieldCheck],
  [/solidar|entraide|compassion|bienveill/, HandHeart],
  [/respect|dignit|partenar|collabor|dialogue/, Handshake],
  [/autonom|progr|croiss|developp/, TrendUp],
  [/durab|environ|ecolo/, Leaf],
  [/equit|egalit|justice|inclus/, Scales],
  [/innov|creativ/, Lightbulb],
  [/proximit|terrain|local/, MapPin],
  [/excell|qualit|rigueur/, Medal],
  [/format|educ|apprent|savoir/, GraduationCap],
  [/engag|impact|resultat|efficac/, Target],
  [/communaut|participat|ensemble|famill/, UsersThree],
]

function ValueIcon({ title }: { title: string }) {
  const s = title.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  const Icon = ICONS.find(([re]) => re.test(s))?.[1] ?? SealCheck
  return <Icon size={48} weight="light" className="text-white" aria-hidden />
}

/**
 * Valeurs et principes d'action, saisis par la fondation dans l'admin, présentés en bandeau
 * bleu marine « atouts » : titre à gauche, atouts en ligne avec de grandes icônes au trait fin.
 * Rien n'est rédigé à sa place : tant que la liste est vide, la mention [À COMPLÉTER] s'affiche.
 */
export function ValuesSection({
  title,
  intro,
  values,
}: {
  title: string
  intro?: string | null
  values: OrganizationValue[]
}) {
  const groups = GROUPS.map((g) => ({
    ...g,
    items: values.filter((v) => v.kind === g.kind),
  })).filter((g) => g.items.length > 0)

  return (
    <section className="on-navy on-navy-800 relative overflow-hidden">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 md:py-20 lg:grid-cols-[16rem_1fr] lg:gap-0">
        <div className="min-w-0 lg:border-r lg:border-white/15 lg:pr-8" data-reveal>
          <span className="flex items-center gap-1.5" aria-hidden>
            <span className="size-2.5 bg-orange-500" />
            <span className="h-0.5 w-10 bg-orange-500" />
          </span>
          <h2 className="font-display mt-4 text-2xl leading-tight font-extrabold text-white md:text-4xl lg:text-3xl">
            <Emphasis text={title} onDark highlightLast />
          </h2>
          {intro && <p className="mt-4 text-white/80">{intro}</p>}
        </div>

        <div className="min-w-0 lg:pl-8">
          {groups.length === 0 ? (
            <p>
              <ToCompleteMark />
            </p>
          ) : (
            <div className="grid gap-10">
              {groups.map((g) => (
                <div key={g.kind}>
                  {groups.length > 1 && (
                    <h3 className="text-xs font-bold tracking-[0.2em] text-orange-400 uppercase">
                      {g.title}
                    </h3>
                  )}
                  <ul
                    className={`grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-5 lg:gap-x-0 ${groups.length > 1 ? 'mt-6' : ''}`}
                  >
                    {g.items.map((v) => {
                      return (
                        <li
                          key={v.id}
                          data-reveal
                          className="flex min-w-0 flex-col items-center text-center lg:border-l lg:border-white/15 lg:px-4 lg:first:border-l-0"
                        >
                          <span className="relative">
                            <ValueIcon title={v.title} />
                            <CheckCircle
                              size={18}
                              weight="fill"
                              className="bg-navy-800 absolute -right-1.5 -bottom-1 rounded-full text-green-400"
                              aria-hidden
                            />
                          </span>
                          <span className="font-display mt-4 font-bold break-words text-white">
                            {v.title}
                          </span>
                          {v.description && (
                            <span className="mt-1.5 text-sm break-words text-white/80">
                              {v.description}
                            </span>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
