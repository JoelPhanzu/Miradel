import type { Metadata } from 'next'
import { Catalog } from '@/components/public/Catalog'
import { PageHeader } from '@/components/public/PageHeader'
import { getPageSections, getProductCategories, getPublishedProducts } from '@/lib/data/public'

export const metadata: Metadata = {
  title: 'Boutique solidaire',
  description:
    'Produits locaux agro-alimentaires et d’hygiène fabriqués dans le cadre des programmes de la Fondation MIRADEL FEVEPA. Commande sur WhatsApp.',
}

export default async function ShopPage() {
  const [{ shop_intro: intro }, products, categories] = await Promise.all([
    getPageSections(),
    getPublishedProducts(),
    getProductCategories(),
  ])
  return (
    <>
      <PageHeader title={intro?.title ?? 'Boutique solidaire'} intro={intro?.body} />
      <div className="mx-auto max-w-[1320px] px-4 pb-24 md:px-8">
        <Catalog products={products} categories={categories} />
      </div>
    </>
  )
}
