import { getSiteSettings } from '@/lib/data/public'

/** Données structurées NGO (Google : nom, contact, adresse, réseaux). */
export async function StructuredData() {
  const settings = await getSiteSettings()
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3420'

  const data = {
    '@context': 'https://schema.org',
    '@type': 'NGO',
    name: settings.organizationName,
    alternateName: settings.acronym ?? undefined,
    description: settings.tagline,
    url: site,
    image: `${site}/opengraph-image`,
    telephone: settings.phone,
    email: settings.emails[0],
    address: {
      '@type': 'PostalAddress',
      streetAddress: settings.address ?? undefined,
      addressCountry: 'CD',
    },
    areaServed: { '@type': 'Country', name: 'République démocratique du Congo' },
    sameAs: Object.values(settings.socialLinks).filter(Boolean),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  )
}
