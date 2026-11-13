import { Suspense } from 'react'
import { CartProvider } from '@/components/public/cart/CartProvider'
import { CtaBand } from '@/components/public/CtaBand'
import { Footer } from '@/components/public/Footer'
import { Header } from '@/components/public/Header'
import { HideOn } from '@/components/public/HideOn'
import { RevealObserver } from '@/components/public/RevealObserver'
import { StructuredData } from '@/components/public/StructuredData'
import { TodayBanner } from '@/components/public/TodayBanner'
import { WhatsAppFloat } from '@/components/public/WhatsAppFloat'

export default function PublicLayout({ children }: LayoutProps<'/'>) {
  return (
    <CartProvider>
      <a
        href="#contenu"
        className="text-navy-950 sr-only z-50 rounded-full bg-orange-500 px-5 py-3 font-bold focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Aller au contenu
      </a>
      <Suspense fallback={null}>
        <TodayBanner />
      </Suspense>
      <Header />
      <main id="contenu">{children}</main>
      {/* Bandeau d'appel avant le pied de page (sur l'accueil, il est intégré à la page). */}
      <Suspense fallback={null}>
        <HideOn paths={['/']}>
          <CtaBand />
        </HideOn>
      </Suspense>
      <Footer />
      <WhatsAppFloat />
      <StructuredData />
      <RevealObserver />
    </CartProvider>
  )
}
