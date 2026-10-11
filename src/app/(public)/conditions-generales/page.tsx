import type { Metadata } from 'next'
import { LegalPage } from '@/components/public/LegalPage'

export const metadata: Metadata = {
  title: 'Conditions générales',
  description: 'Conditions générales de vente et d’utilisation du site de la Fondation MIRADEL FEVEPA.',
}

export default function TermsPage() {
  return <LegalPage sectionKey="legal_terms" fallbackTitle="Conditions générales" />
}
