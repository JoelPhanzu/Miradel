import { formatAmount } from '@/lib/format'
import type { EffectivePrice } from '@/lib/pricing/types'

interface PriceTagProps {
  /** null = prix pas encore confirmé par la fondation. */
  price: EffectivePrice | null
  className?: string
}

/** « 4 500 FC ~~5 000 FC~~ ». Le prix vient toujours de getEffectivePrice(). */
export function PriceTag({ price, className = '' }: PriceTagProps) {
  if (!price) {
    return <p className={`text-ink-soft text-sm font-semibold ${className}`}>Prix à confirmer</p>
  }
  const discounted = price.amount < price.baseAmount
  return (
    <p className={`text-sm ${className}`}>
      <span className={`font-semibold whitespace-nowrap ${discounted ? 'text-accent' : ''}`}>
        {formatAmount(price.amount, price.currency)}
      </span>
      {discounted && (
        <>
          {' '}
          <s className="text-ink-soft whitespace-nowrap">
            {formatAmount(price.baseAmount, price.currency)}
          </s>
        </>
      )}
    </p>
  )
}
