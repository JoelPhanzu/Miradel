import { Suspense } from 'react'
import { CartProvider } from '@/components/public/cart/CartProvider'
import { Footer } from '@/components/public/Footer'
import { Header } from '@/components/public/Header'
import { StructuredData } from '@/components/public/StructuredData'
import { TodayBanner } from '@/components/public/TodayBanner'
import { WhatsAppFloat } from '@/components/public/WhatsAppFloat'

export default function PublicLayout({ children }: LayoutProps<'/'>) {
  return (
    <CartProvider>
      <a
        href="#contenu"
        className="bg-ink text-cream sr-only z-50 px-4 py-3 focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Aller au contenu
      </a>
      <Suspense fallback={null}>
        <TodayBanner />
      </Suspense>
      <Header />
      <main id="contenu">{children}</main>
      <Footer />
      <WhatsAppFloat />
      <StructuredData />
    </CartProvider>
  )
}
