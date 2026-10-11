import Link from 'next/link'
import type { Category, Product } from '@/types/content'
import { ProductGrid } from './ProductGrid'

/** Catalogue : onglets de catégories (pages /boutique/c/<slug>, indexables) et produits. */
export function Catalog({
  products,
  categories,
  activeSlug,
}: {
  products: Product[]
  categories: Category[]
  activeSlug?: string
}) {
  const visible = categories.filter((c) => products.some((p) => p.categoryId === c.id))
  const active = visible.find((c) => c.slug === activeSlug)
  const shown = active ? products.filter((p) => p.categoryId === active.id) : products

  const pill = (selected: boolean) =>
    `inline-flex min-h-11 shrink-0 items-center rounded-full border px-5 text-sm font-medium transition ${
      selected ? 'bg-ink text-cream border-ink' : 'border-line hover:border-ink'
    }`

  return (
    <>
      {visible.length > 1 && (
        <nav
          aria-label="Catégories"
          className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0"
        >
          <Link href="/boutique" className={pill(!active)} aria-current={!active ? 'page' : undefined}>
            Tout
          </Link>
          {visible.map((c) => (
            <Link
              key={c.id}
              href={`/boutique/c/${c.slug}`}
              className={pill(active?.id === c.id)}
              aria-current={active?.id === c.id ? 'page' : undefined}
            >
              {c.name}
            </Link>
          ))}
        </nav>
      )}
      {active?.description && <p className="text-ink-soft mt-6 max-w-[60ch]">{active.description}</p>}
      <div className="mt-10">
        {shown.length === 0 ? (
          <p className="text-ink-soft">Aucun produit dans cette catégorie pour le moment.</p>
        ) : (
          <ProductGrid products={shown} />
        )}
      </div>
      <p className="text-ink-soft mt-16 max-w-[60ch] text-sm">
        Produits fabriqués dans le cadre des programmes de la fondation. Commande confirmée sur
        WhatsApp ; paiement par mobile money, virement, à la livraison ou au retrait.
      </p>
    </>
  )
}
