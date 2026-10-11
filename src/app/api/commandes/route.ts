import { NextResponse } from 'next/server'
import { looksLikeSpam } from '@/lib/antispam'
import { isRateLimited } from '@/lib/rate-limit'
import { createOrder } from '@/lib/server/checkout'
import { clientIp } from '@/lib/server/request'

export async function POST(request: Request) {
  if (isRateLimited(`order:${clientIp(request)}`, 8, 10 * 60_000)) {
    return NextResponse.json(
      { ok: false, errors: { form: 'Trop de demandes. Réessayez dans quelques minutes.' } },
      { status: 429 },
    )
  }
  const body = await request.json().catch(() => null)
  if (!body || looksLikeSpam(body)) {
    return NextResponse.json({ ok: false, errors: { form: 'Envoi refusé.' } }, { status: 400 })
  }
  const result = await createOrder(body)
  return NextResponse.json(result, { status: result.ok ? 201 : result.status })
}
