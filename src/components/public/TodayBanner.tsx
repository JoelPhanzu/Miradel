import Link from 'next/link'
import { connection } from 'next/server'
import { getPromotions } from '@/lib/data/public'
import { getActivePromotions } from '@/lib/pricing'

/** Bandeau « Aujourd'hui : … » si une promotion avec bannière est active à l'heure de Kinshasa. */
export async function TodayBanner() {
  await connection()
  const promotions = (await getPromotions()).filter((p) => p.showBanner)
  const [promotion] = getActivePromotions(promotions, new Date())
  if (!promotion) return null

  return (
    <Link
      href="/promotions"
      className="bg-accent text-accent-ink block px-4 py-2.5 text-center text-sm font-semibold hover:underline"
    >
      Aujourd&apos;hui : {promotion.title}
      {promotion.subtitle ? ` - ${promotion.subtitle}` : ''}
    </Link>
  )
}
