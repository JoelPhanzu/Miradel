import type { PaymentNumber } from '@/db/schema'

/**
 * Coordonnées de paiement saisies par la fondation (admin > Paramètres).
 * Jamais inventées : si elles manquent, la fondation les communique sur WhatsApp.
 */
export function PaymentDetails({
  method,
  paymentNumbers,
  bankDetails,
}: {
  method: 'mobile_money' | 'virement'
  paymentNumbers: PaymentNumber[]
  bankDetails: string | null
}) {
  if (method === 'virement') {
    return bankDetails ? (
      <p className="mt-2 whitespace-pre-line">{bankDetails}</p>
    ) : (
      <p className="mt-2">La fondation vous communique ses coordonnées bancaires sur WhatsApp.</p>
    )
  }
  return paymentNumbers.length > 0 ? (
    <ul className="mt-2 grid gap-2">
      {paymentNumbers.map((p) => (
        <li key={`${p.provider}-${p.number}`}>
          <strong>{p.provider}</strong> : {p.number}
          {p.holder && <span className="text-ink-soft"> ({p.holder})</span>}
        </li>
      ))}
    </ul>
  ) : (
    <p className="mt-2">La fondation vous communique le numéro mobile money sur WhatsApp.</p>
  )
}
