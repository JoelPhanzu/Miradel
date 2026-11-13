import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { FacebookLogo, MapPin, WhatsappLogo } from '@phosphor-icons/react/ssr'
import { ButtonLink } from '@/components/public/ButtonLink'
import { SectionHeading, Kicker } from '@/components/public/cards'
import { PageHeader } from '@/components/public/PageHeader'
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
import { IMAGES } from '@/content/images'
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

const container = 'mx-auto max-w-7xl px-4 sm:px-6'

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
      <PageHeader
        title={e.name}
        intro={e.tagline}
        imageUrl={e.coverImageUrl}
        image={IMAGES.pages.vitrine}
        crumbs={[{ href: '/vitrine', label: 'Vitrine de l’entrepreneur' }]}
        meta={
          <div className="grid gap-5">
            <div className="flex flex-wrap items-center gap-4">
              {e.photoUrl && (
                <span className="relative size-16 shrink-0 overflow-hidden rounded-full border-4 border-white shadow-md">
                  <Image
                    src={e.photoUrl}
                    alt={e.ownerName ?? e.name}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </span>
              )}
              <div className="grid min-w-0 gap-1.5">
                <span className="w-fit rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
                  {e.isFoundation ? 'La fondation' : (sector?.name ?? 'Entrepreneur accompagné')}
                </span>
                {e.ownerName && <p className="text-white/90">Porté par {e.ownerName}</p>}
              </div>
            </div>
            {(e.location || program) && (
              <ul className="grid gap-2 text-sm text-white/90">
                {e.location && (
                  <li className="inline-flex items-center gap-2">
                    <MapPin
                      size={18}
                      weight="fill"
                      className="shrink-0 text-orange-400"
                      aria-hidden
                    />
                    <span className="min-w-0 break-words">{e.location}</span>
                  </li>
                )}
                {program && (
                  <li>
                    Accompagné dans le programme{' '}
                    <Link
                      href={`/nos-programmes/${program.slug}`}
                      className="font-semibold text-orange-400 underline underline-offset-4 hover:text-orange-300"
                    >
                      {program.title}
                    </Link>
                  </li>
                )}
              </ul>
            )}
            <div className="flex flex-wrap gap-3">
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
                  variant="onDark"
                >
                  <FacebookLogo size={18} aria-hidden />
                  Facebook
                </ButtonLink>
              )}
            </div>
          </div>
        }
      />

      {!isMissing(e.story) && (
        <section className={`${container} py-14 md:py-20`}>
          <div className="max-w-[68ch]">
            <Kicker className="mb-3" />
            <h2 className="font-display text-heading text-2xl font-extrabold md:text-3xl">
              Son histoire
            </h2>
            <div className="mt-6">
              <SimpleMarkdown text={e.story!} />
            </div>
          </div>
        </section>
      )}

      <section className="bg-gray-50">
        <div className={`${container} py-14 md:py-20`}>
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
            <p className="text-ink-soft mx-auto mt-12 max-w-[60ch] text-center text-sm">
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
    <Suspense fallback={<div className="mx-auto h-[70vh] max-w-7xl" />}>
      <EntrepreneurPageContent params={params} />
    </Suspense>
  )
}
