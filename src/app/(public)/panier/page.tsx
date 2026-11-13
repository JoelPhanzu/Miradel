import type { Metadata } from 'next'
import { Checkout } from '@/components/public/cart/Checkout'
import { PageHeader } from '@/components/public/PageHeader'
import { IMAGES } from '@/content/images'
import { getSiteSettings } from '@/lib/data/public'

export const metadata: Metadata = {
  title: 'Panier',
  robots: { index: false },
}

export default async function CartPage() {
  const settings = await getSiteSettings()
  return (
    <>
      <PageHeader
        title="Votre panier"
        image={IMAGES.pages.panier}
        crumbs={[{ href: '/vitrine', label: 'Vitrine de l’entrepreneur' }]}
      />
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-20">
        <Checkout
          organizationName={settings.organizationName}
          whatsappNumber={settings.whatsappNumber}
          paymentNumbers={settings.paymentNumbers}
          bankDetails={settings.bankDetails}
        />
      </div>
    </>
  )
}
