import type { Metadata } from 'next'
import { Checkout } from '@/components/public/cart/Checkout'
import { PageHeader } from '@/components/public/PageHeader'
import { getSiteSettings } from '@/lib/data/public'

export const metadata: Metadata = {
  title: 'Panier',
  robots: { index: false },
}

export default async function CartPage() {
  const settings = await getSiteSettings()
  return (
    <>
      <PageHeader title="Votre panier" />
      <div className="mx-auto max-w-[1320px] px-4 pb-24 md:px-8">
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
