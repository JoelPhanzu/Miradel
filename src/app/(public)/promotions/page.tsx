import type { Metadata } from 'next'
import Image from 'next/image'
import { connection } from 'next/server'
import { Suspense } from 'react'
import { ButtonLink } from '@/components/public/ButtonLink'
import { PageHeader } from '@/components/public/PageHeader'
import { WeekdayDots, weekdayNames } from '@/components/public/WeekdayDots'
import { getPageSections, getPromotions } from '@/lib/data/public'
import { isPromotionActive } from '@/lib/pricing'
import type { PromotionCard } from '@/types/content'

export const metadata: Metadata = {
  title: 'Offres du moment',
  description: 'Les offres en cours de la boutique solidaire de la Fondation MIRADEL FEVEPA.',
}

const endFormatter = new Intl.DateTimeFormat('fr-FR', {
  timeZone: 'Africa/Kinshasa',
  day: 'numeric',
  month: 'long',
})

function PromoCard({ promo, today }: { promo: PromotionCard; today: boolean }) {
  const recurring = promo.weekdays && promo.weekdays.length > 0
  return (
    <article
      data-reveal
      className={`flex h-full flex-col p-6 md:p-8 ${recurring ? 'bg-accent-soft' : 'border-line border'}`}
    >
      {promo.bannerUrl && (
        <div className="relative -mx-6 -mt-6 mb-6 aspect-[16/9] md:-mx-8 md:-mt-8">
          <Image
            src={promo.bannerUrl}
            alt=""
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2">
        {promo.badge && (
          <span className="bg-accent text-accent-ink rounded-full px-3 py-1 text-xs font-semibold">
            {promo.badge}
          </span>
        )}
        {today && (
          <span className="border-accent text-accent rounded-full border px-3 py-1 text-xs font-semibold">
            Aujourd&apos;hui
          </span>
        )}
      </div>
      <h2 className="font-display mt-5 text-4xl leading-tight font-medium md:text-5xl">
        {promo.title}
      </h2>
      {promo.subtitle && <p className="font-display mt-2 text-2xl">{promo.subtitle}</p>}
      {promo.description && <p className="text-ink-soft mt-4 max-w-[52ch]">{promo.description}</p>}
      {recurring && (
        <div className="mt-6">
          <WeekdayDots days={promo.weekdays!} small />
          <p className="text-ink-soft mt-2 text-sm">Chaque {weekdayNames(promo.weekdays!)}</p>
        </div>
      )}
      {promo.endsAt && (
        <p className="text-ink-soft mt-4 text-sm">
          Jusqu&apos;au {endFormatter.format(new Date(promo.endsAt))}
        </p>
      )}
      {promo.ctaHref && (
        <div className="mt-auto pt-8">
          <ButtonLink href={promo.ctaHref} variant={recurring ? 'primary' : 'outline'}>
            {promo.ctaLabel ?? 'En profiter'}
          </ButtonLink>
        </div>
      )}
    </article>
  )
}

/** Les offres récurrentes restent visibles toute la semaine ; les offres datées, pendant leur période. */
async function PromotionList() {
  await connection()
  const now = new Date()
  const promotions = (await getPromotions()).filter((p) => {
    const started = !p.startsAt || new Date(p.startsAt) <= now
    const notEnded = !p.endsAt || new Date(p.endsAt) >= now
    return started && notEnded
  })

  if (promotions.length === 0) {
    return <p className="text-ink-soft">Aucune offre en cours. Revenez bientôt !</p>
  }

  return (
    <ul className="grid gap-6 md:grid-cols-2">
      {promotions.map((promo, i) => (
        <li
          key={promo.id}
          className={i === 0 && promotions.length % 2 === 1 ? 'md:col-span-2' : ''}
        >
          <PromoCard
            promo={promo}
            today={Boolean(promo.weekdays?.length) && isPromotionActive(promo, now)}
          />
        </li>
      ))}
    </ul>
  )
}

export default async function PromotionsPage() {
  const { promotions_intro: intro } = await getPageSections()
  return (
    <>
      <PageHeader title={intro?.title ?? 'Offres du moment'} intro={intro?.body} />
      <div className="mx-auto max-w-[1320px] px-4 pb-24 md:px-8">
        <Suspense fallback={<div className="bg-cream-deep h-96 animate-pulse" />}>
          <PromotionList />
        </Suspense>
      </div>
    </>
  )
}
