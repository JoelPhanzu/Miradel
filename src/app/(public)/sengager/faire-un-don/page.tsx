import type { Metadata } from 'next'
import { Suspense } from 'react'
import { DonationForm } from '@/components/public/form/DonationForm'
import { PageHeader } from '@/components/public/PageHeader'
import { PaymentDetails } from '@/components/public/PaymentDetails'
import { RichText } from '@/components/public/ToComplete'
import { getPageSections, getPublishedPrograms, getSiteSettings } from '@/lib/data/public'

export const metadata: Metadata = {
  title: 'Faire un don',
  description:
    'Soutenir la Fondation MIRADEL FEVEPA par mobile money ou virement, puis déclarer votre don en ligne.',
}

const container = 'mx-auto max-w-[1320px] px-4 md:px-8'

export default async function DonatePage() {
  const [{ donate_intro: intro }, settings, programs] = await Promise.all([
    getPageSections(),
    getSiteSettings(),
    getPublishedPrograms(),
  ])

  return (
    <>
      <PageHeader title={intro?.title ?? 'Faire un don'} />

      <div className={`${container} grid gap-14 pb-24 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20`}>
        <div className="grid content-start gap-10">
          <section>
            <h2 className="font-display text-3xl font-medium">À quoi sert votre don</h2>
            <div className="mt-4">
              <RichText text={intro?.body} />
            </div>
          </section>

          <section className="bg-cream-deep grid gap-6 p-6 md:p-8">
            <h2 className="font-display text-3xl font-medium">1. Envoyer votre don</h2>
            <div>
              <p className="font-semibold">Mobile money</p>
              <PaymentDetails
                method="mobile_money"
                paymentNumbers={settings.paymentNumbers}
                bankDetails={settings.bankDetails}
              />
            </div>
            <div>
              <p className="font-semibold">Virement bancaire</p>
              <PaymentDetails
                method="virement"
                paymentNumbers={settings.paymentNumbers}
                bankDetails={settings.bankDetails}
              />
            </div>
          </section>

          <p className="text-ink-soft text-sm">
            Le site enregistre une déclaration : c’est l’équipe de la fondation qui confirme la
            réception des fonds. Aucun reçu fiscal n’est délivré automatiquement par le site.
          </p>
        </div>

        <section>
          <h2 className="font-display text-3xl font-medium">2. Déclarer votre don</h2>
          <p className="text-ink-soft mt-2">
            Quelques informations pour que l’équipe retrouve votre paiement et vous remercie.
          </p>
          <div className="mt-8">
            <Suspense fallback={<div className="bg-cream-deep h-[40rem] animate-pulse" />}>
              <DonationForm
                organizationName={settings.organizationName}
                whatsappNumber={settings.whatsappNumber}
                suggestedAmounts={settings.donationAmounts}
                programs={programs.map((p) => ({ slug: p.slug, title: p.title }))}
              />
            </Suspense>
          </div>
        </section>
      </div>
    </>
  )
}
