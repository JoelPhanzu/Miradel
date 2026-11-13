import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, MapPin } from '@phosphor-icons/react/ssr'
import type { Entrepreneur } from '@/types/content'
import { PhotoSlot } from './PhotoSlot'

/** Carte d'une vitrine : photo de l'activité, secteur, porteur de projet, lien vers sa vitrine. */
export function EntrepreneurCard({
  entrepreneur: e,
  sectorName,
  productCount,
}: {
  entrepreneur: Entrepreneur
  sectorName?: string | null
  productCount?: number
}) {
  const href = `/vitrine/${e.slug}`
  return (
    <article className="group bg-cream border-line flex h-full flex-col overflow-hidden rounded-3xl border shadow-sm transition hover:shadow-md">
      <Link href={href} className="relative block overflow-hidden" tabIndex={-1} aria-hidden>
        <PhotoSlot
          src={e.coverImageUrl}
          alt=""
          brief={`photo de l’activité de ${e.name} (atelier, produits, au travail)`}
          className="aspect-[4/3] transition duration-700 group-hover:scale-[1.03]"
          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
        />
        {e.photoUrl && (
          <span className="border-cream absolute bottom-3 left-3 size-16 overflow-hidden rounded-full border-4">
            <Image src={e.photoUrl} alt="" fill sizes="64px" className="object-cover" />
          </span>
        )}
      </Link>
      <div className="flex grow flex-col p-5">
        <p className="text-ochre text-xs font-bold tracking-[0.14em] uppercase">
          {e.isFoundation ? 'La fondation' : (sectorName ?? 'Entrepreneur accompagné')}
        </p>
        <h3 className="font-display mt-1 text-2xl leading-tight font-bold">
          <Link href={href} className="hover:text-accent">
            {e.name}
          </Link>
        </h3>
        {e.ownerName && <p className="text-ink-soft text-sm">Porté par {e.ownerName}</p>}
        {e.tagline && <p className="text-ink-soft mt-3">{e.tagline}</p>}
        {e.location && (
          <p className="text-ink-soft mt-3 inline-flex items-center gap-1.5 text-sm">
            <MapPin size={16} aria-hidden />
            {e.location}
          </p>
        )}
        <Link
          href={href}
          className="text-accent mt-auto inline-flex min-h-11 items-center gap-2 pt-4 text-sm font-semibold"
          aria-label={`Voir la vitrine de ${e.name}`}
        >
          Voir sa vitrine
          {productCount ? ` (${productCount} produit${productCount > 1 ? 's' : ''})` : ''}
          <ArrowRight size={16} aria-hidden />
        </Link>
      </div>
    </article>
  )
}
