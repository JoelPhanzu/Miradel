import type { Metadata, Viewport } from 'next'
import { Manrope, Montserrat } from 'next/font/google'
import './globals.css'

// Deux familles maximum, sous-ensemble latin, auto-hébergées par next/font.
// Titres : Montserrat (franche, comme le site de référence) ; texte : Manrope (très lisible).
const montserrat = Montserrat({
  variable: '--font-montserrat',
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  display: 'swap',
})

const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3420'),
  title: {
    default: 'Fondation MIRADEL FEVEPA | Autonomiser les femmes et les jeunes en RDC',
    template: '%s | Fondation MIRADEL FEVEPA',
  },
  description:
    'La Fondation MIRADEL FEVEPA agit pour autonomiser les femmes et les jeunes vulnérables en RDC par des actions concrètes et durables. Programmes, impact, transparence, dons et vitrine des entrepreneurs accompagnés.',
  openGraph: { locale: 'fr_FR', type: 'website', siteName: 'Fondation MIRADEL FEVEPA' },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#012060' },
    { media: '(prefers-color-scheme: dark)', color: '#050d1f' },
  ],
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="fr" className={`${montserrat.variable} ${manrope.variable} antialiased`}>
      <body className="min-h-dvh font-sans text-base leading-relaxed">{children}</body>
    </html>
  )
}
