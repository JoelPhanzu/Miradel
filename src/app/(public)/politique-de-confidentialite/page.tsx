import type { Metadata } from 'next'
import { LegalPage } from '@/components/public/LegalPage'

export const metadata: Metadata = {
  title: 'Politique de confidentialité',
  description:
    'Utilisation des données personnelles collectées par le site de la Fondation MIRADEL FEVEPA (formulaires, dons, commandes, newsletter).',
}

export default function PrivacyPage() {
  return <LegalPage sectionKey="legal_privacy" fallbackTitle="Politique de confidentialité" />
}
