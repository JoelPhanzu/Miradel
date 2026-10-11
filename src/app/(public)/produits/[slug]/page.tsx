import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { connection } from 'next/server'
import { Suspense } from 'react'
import { ArrowLeft, WhatsappLogo } from '@phosphor-icons/react/ssr'
import { ButtonLink } from '@/components/public/ButtonLink'
import { AddToCart } from '@/components/public/cart/AddToCart'
import { PhotoSlot } from '@/components/public/PhotoSlot'
import { PriceTag } from '@/components/public/PriceTag'
import { OrToComplete, RichText } from '@/components/public/ToComplete'
import {
  getProductBySlug,
  getPromotions,
  getPublishedPrograms,
  getPublishedProducts,
  getSiteSettings,
} from '@/lib/data/public'
import { formatAmount } from '@/lib/format'
import { productPrice } from '@/lib/pricing/items'
import { slugParams } from '@/lib/static-params'
import { buildWhatsAppUrl } from '@/lib/whatsapp'

export async function generateStaticParams() {
  return slugParams((await getPublishedProducts()).map((p) => p.slug))
}

export async function generateMetadata({
  params,
}: PageProps<'/produits/[slug]'>): Promise<Metadata> {
  const product = await getProductBySlug((await params).slug)
  if (!product) return {}
  const description =
    product.description && product.description !== '[À COMPLÉTER]'
      ? product.description
      : `${product.name}, produit de la boutique solidaire de la Fondation MIRADEL FEVEPA.`
  return {
    title: product.name,
    description,
    openGraph: product.images[0] ? { images: [product.images[0]] } : undefined,
  }
}

/** Prix et ajout au panier : calculés à la requête (offres du jour). */
async function Purchase({ slug }: { slug: string }) {
  await connection()
  const [product, promotions, settings] = await Promise.all([
    getProductBySlug(slug),
    getPromotions(),
    getSiteSettings(),
  ])
  if (!product) return null
  const price = productPrice(product, promotions, new Date())

  // Données structurées Product (Google) ; l'offre n'apparaît qu'avec un prix confirmé.
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3420'
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images.map((src) => `${site}${src}`),
    brand: { '@type': 'Organization', name: settings.organizationName },
    ...(price && {
      offers: {
        '@type': 'Offer',
        price: price.currency === 'USD' ? (price.amount / 100).toFixed(2) : String(price.amount),
        priceCurrency: price.currency,
        availability:
          product.stock === 0 ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
        url: `${site}/produits/${product.slug}`,
      },
    }),
  }

  // Quantités avec réduction : affichées pour informer (le calcul reste côté serveur).
  const quantityOffers = promotions.filter(
    (p) => p.minQuantity && productPrice(product, [p], new Date(), p.minQuantity)?.appliedPromotion,
  )

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <PriceTag price={price} className="text-xl" />
      {price && quantityOffers.length > 0 && (
        <ul className="text-ochre mt-2 text-sm font-semibold">
          {quantityOffers.map((p) => {
            const offer = productPrice(product, [p], new Date(), p.minQuantity!)!
            return (
              <li key={p.id}>
                Dès {p.minQuantity} unités : {formatAmount(offer.amount, offer.currency)} l’unité
              </li>
            )
          })}
        </ul>
      )}
      <div className="mt-8">
        {price ? (
          <AddToCart
            product={{
              id: product.id,
              slug: product.slug,
              name: product.name,
              imageUrl: product.images[0] ?? null,
              unitAmount: price.amount,
              currency: price.currency,
              variants: product.variants,
              outOfStock: product.stock === 0,
            }}
          />
        ) : (
          <ButtonLink
            href={buildWhatsAppUrl(
              settings.whatsappNumber,
              `Bonjour ${settings.organizationName}, je souhaite commander : ${product.name}. Pouvez-vous m’indiquer le prix ?`,
            )}
            target="_blank"
            rel="noopener noreferrer"
            variant="whatsapp"
          >
            <WhatsappLogo size={18} weight="fill" aria-hidden />
            Demander le prix sur WhatsApp
          </ButtonLink>
        )}
      </div>
    </>
  )
}

async function ProductPageContent({ params }: Pick<PageProps<'/produits/[slug]'>, 'params'>) {
  const { slug } = await params
  const [product, programs] = await Promise.all([getProductBySlug(slug), getPublishedPrograms()])
  if (!product) notFound()
  const program = programs.find((p) => p.id === product.programId)
  const [cover, ...others] = product.images

  return (
    <article className="mx-auto max-w-[1320px] px-4 pt-8 pb-24 md:px-8">
      <Link
        href="/boutique"
        className="text-ink-soft hover:text-ink inline-flex min-h-11 items-center gap-2 text-sm"
      >
        <ArrowLeft size={16} aria-hidden />
        Toute la boutique
      </Link>

      <div className="mt-6 grid gap-10 md:grid-cols-2 md:gap-16">
        <div className="space-y-3">
          <PhotoSlot
            src={cover}
            alt={product.name}
            brief={`photo nette du produit ${product.name} sur fond neutre`}
            className="aspect-[4/5]"
            sizes="(min-width: 768px) 50vw, 100vw"
            priority
          />
          {others.length > 0 && (
            <ul className="grid grid-cols-3 gap-3">
              {others.map((src) => (
                <li key={src} className="relative aspect-square overflow-hidden">
                  <Image src={src} alt={product.name} fill sizes="16vw" className="object-cover" />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="md:pt-8">
          <h1 className="rise font-display text-5xl leading-none font-medium tracking-tight md:text-6xl">
            {product.name}
          </h1>
          <p className="text-ink-soft mt-3">
            Contenance : <OrToComplete value={product.packaging} />
          </p>
          <div className="mt-6">
            <Suspense fallback={<div className="bg-cream-deep h-40 animate-pulse" />}>
              <Purchase slug={slug} />
            </Suspense>
          </div>

          <div className="mt-10 max-w-[56ch]">
            <RichText text={product.description} />
          </div>

          <dl className="divide-line border-line mt-10 divide-y border-y">
            {product.composition && (
              <div className="py-4">
                <dt className="text-sm font-semibold">Ingrédients / composition</dt>
                <dd className="text-ink-soft mt-1 whitespace-pre-line">{product.composition}</dd>
              </div>
            )}
            {product.usageTips && (
              <div className="py-4">
                <dt className="text-sm font-semibold">Conseils d’utilisation</dt>
                <dd className="text-ink-soft mt-1 whitespace-pre-line">{product.usageTips}</dd>
              </div>
            )}
            {program && (
              <div className="py-4">
                <dt className="text-sm font-semibold">Fabriqué dans le cadre du programme</dt>
                <dd className="mt-1">
                  <Link
                    href={`/nos-programmes/${program.slug}`}
                    className="text-accent underline underline-offset-4"
                  >
                    {program.title}
                  </Link>
                </dd>
              </div>
            )}
          </dl>

          <p className="text-ink-soft mt-8 max-w-[52ch] text-sm">
            Commande confirmée sur WhatsApp. Paiement par mobile money, virement, à la livraison ou
            au retrait.
          </p>
        </div>
      </div>
    </article>
  )
}

export default function ProductPage({ params }: PageProps<'/produits/[slug]'>) {
  return (
    <Suspense fallback={<div className="mx-auto h-[70vh] max-w-[1320px]" />}>
      <ProductPageContent params={params} />
    </Suspense>
  )
}
