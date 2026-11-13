import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { ArrowLeft, FacebookLogo, MapPin, WhatsappLogo } from '@phosphor-icons/react/ssr'
import { ButtonLink } from '@/components/public/ButtonLink'
import { SectionHeading } from '@/components/public/cards'
import { PhotoSlot } from '@/components/public/PhotoSlot'
import { ProductGrid } from '@/components/public/ProductGrid'
import { SimpleMarkdown } from '@/components/public/SimpleMarkdown'
import { isMissing } from '@/components/public/ToComplete'
import {
  getEntrepreneurBySlug,
  getProductCategories,
  getPublishedEntrepreneurs,
  getPublishedPrograms,
  getPublishedProducts,
  getSectors,
  getSiteSettings,
} from '@/lib/data/public'
import { slugParams } from '@/lib/static-params'
import { sellerWhatsApp } from '@/lib/vitrine'
import { buildWhatsAppUrl } from '@/lib/whatsapp'

export async function generateStaticParams() {
  return slugParams((await getPublishedEntrepreneurs()).map((e) => e.slug))
}

export async function generateMetadata({
  params,
}: PageProps<'/vitrine/[slug]'>): Promise<Metadata> {
  const e = await getEntrepreneurBySlug((await params).slug)
  if (!e) return {}
  return {
    title: `${e.name} | Vitrine de l’entrepreneur`,
    description:
      e.tagline ?? `${e.name}, dans la Vitrine de l’entrepreneur de la Fondation MIRADEL FEVEPA.`,
    openGraph: e.coverImageUrl ? { images: [e.coverImageUrl] } : undefined,
  }
}

const container = 'mx-auto max-w-[1320px] px-4 md:px-8'

async function EntrepreneurPageContent({ params }: Pick<PageProps<'/vitrine/[slug]'>, 'params'>) {
  const { slug } = await params
  const e = await getEntrepreneurBySlug(slug)
  if (!e) notFound()
  const [products, categories, sectors, programs, settings] = await Promise.all([
    getPublishedProducts(),
    getProductCategories(),
    getSectors(),
    getPublishedPrograms(),
    getSiteSettings(),
  ])
  const own = products.filter((p) => p.entrepreneurId === e.id)
  const sector = sectors.find((s) => s.id === e.sectorId)
  const program = programs.find((p) => p.id === e.programId)
  // Produits regroupés par catégorie quand il y en a plusieurs.
  const groups = categories
    .map((c) => ({ ...c, items: own.filter((p) => p.categoryId === c.id) }))
    .filter((g) => g.items.length > 0)
  const uncategorized = own.filter((p) => !categories.some((c) => c.id === p.categoryId))
  const contactUrl = buildWhatsAppUrl(
    sellerWhatsApp(e, settings.whatsappNumber),
    e.isFoundation || !e.whatsappNumber
      ? `Bonjour ${settings.organizationName}, je vous contacte au sujet de la vitrine « ${e.name} ».`
      : `Bonjour ${e.name}, je vous contacte après avoir vu votre vitrine sur le site de la ${settings.organizationName}.`,
  )

  return (
    <article>
      <div className={`${container} pt-8`}>
        <Link
          href="/vitrine"
          className="text-ink-soft hover:text-ink inline-flex min-h-11 items-center gap-2 text-sm"
        >
          <ArrowLeft size={16} aria-hidden />
          Toute la Vitrine de l’entrepreneur
        </Link>
      </div>

      <header
        className={`${container} mt-4 grid gap-10 pb-12 md:grid-cols-[1fr_1fr] md:items-center`}
      >
        <div className="relative">
          <PhotoSlot
            src={e.coverImageUrl}
            alt={`Activité de ${e.name}`}
            brief={`photo de l’activité de ${e.name} (atelier, produits, au travail)`}
            className="aspect-[4/3] rounded-3xl"
            sizes="(min-width: 768px) 50vw, 100vw"
            priority
          />
          {e.photoUrl && (
            <span className="border-cream absolute -bottom-6 left-6 size-24 overflow-hidden rounded-full border-4 shadow-md">
              <Image
                src={e.photoUrl}
                alt={e.ownerName ?? e.name}
                fill
                sizes="96px"
                className="object-cover"
              />
            </span>
          )}
        </div>
        <div>
          <p className="rise text-ochre text-xs font-bold tracking-[0.2em] uppercase">
            {e.isFoundation ? 'La fondation' : (sector?.name ?? 'Entrepreneur accompagné')}
          </p>
          <h1 className="rise font-display mt-3 text-4xl leading-[1.05] font-extrabold md:text-6xl">
            {e.name}
          </h1>
          {e.ownerName && <p className="text-ink-soft mt-3 text-lg">Porté par {e.ownerName}</p>}
          {e.tagline && <p className="mt-5 max-w-[50ch] text-lg">{e.tagline}</p>}
          <ul className="text-ink-soft mt-5 grid gap-2 text-sm">
            {e.location && (
              <li className="inline-flex items-center gap-2">
                <MapPin size={18} aria-hidden />
                {e.location}
              </li>
            )}
            {program && (
              <li>
                Accompagné dans le programme{' '}
                <Link
                  href={`/nos-programmes/${program.slug}`}
                  className="text-accent font-semibold underline underline-offset-4"
                >
                  {program.title}
                </Link>
              </li>
            )}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink
              href={contactUrl}
              target="_blank"
              rel="noopener noreferrer"
              variant="whatsapp"
            >
              <WhatsappLogo size={18} weight="fill" aria-hidden />
              {e.isFoundation ? 'Écrire à la fondation' : 'Contacter sur WhatsApp'}
            </ButtonLink>
            {e.facebookUrl && (
              <ButtonLink
                href={e.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                variant="outline"
              >
                <FacebookLogo size={18} aria-hidden />
                Facebook
              </ButtonLink>
            )}
          </div>
        </div>
      </header>

      {!isMissing(e.story) && (
        <section className={`${container} pb-16`}>
          <div className="max-w-[68ch]">
            <h2 className="font-display text-3xl font-bold">Son histoire</h2>
            <div className="mt-6">
              <SimpleMarkdown text={e.story!} />
            </div>
          </div>
        </section>
      )}

      <section className="bg-cream-deep">
        <div className={`${container} py-16 md:py-20`}>
          {own.length === 0 ? (
            <>
              <SectionHeading title="Produits" />
              <p className="text-ink-soft mt-6">Les produits de cette vitrine arrivent bientôt.</p>
            </>
          ) : groups.length + (uncategorized.length ? 1 : 0) > 1 ? (
            <div className="grid gap-16">
              {groups.map((g) => (
                <div key={g.id}>
                  <SectionHeading title={g.name} />
                  <div className="mt-8">
                    <ProductGrid products={g.items} hideSeller />
                  </div>
                </div>
              ))}
              {uncategorized.length > 0 && (
                <div>
                  <SectionHeading title="Autres produits" />
                  <div className="mt-8">
                    <ProductGrid products={uncategorized} hideSeller />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <SectionHeading title={`Produits (${own.length})`} />
              <div className="mt-8">
                <ProductGrid products={own} hideSeller />
              </div>
            </>
          )}
          {!e.isFoundation && own.length > 0 && (
            <p className="text-ink-soft mt-12 max-w-[60ch] text-sm">
              Les commandes, le paiement et la livraison se règlent directement avec l’entrepreneur
              sur WhatsApp. La fondation l’accompagne et met son travail en avant.
            </p>
          )}
        </div>
      </section>
    </article>
  )
}

export default function EntrepreneurPage({ params }: PageProps<'/vitrine/[slug]'>) {
  return (
    <Suspense fallback={<div className="mx-auto h-[70vh] max-w-[1320px]" />}>
      <EntrepreneurPageContent params={params} />
    </Suspense>
  )
}
