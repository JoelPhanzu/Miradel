import { NextResponse } from 'next/server'
import { looksLikeSpam } from '@/lib/antispam'
import { isRateLimited } from '@/lib/rate-limit'
import { createParticipation } from '@/lib/server/participation'
import { clientIp } from '@/lib/server/request'

/** Réponse à un formulaire de participation à un programme. */
export async function POST(request: Request) {
  if (isRateLimited(`participation:${clientIp(request)}`, 5, 10 * 60_000)) {
    return NextResponse.json(
      { ok: false, errors: { form: 'Trop de demandes. Réessayez dans quelques minutes.' } },
      { status: 429 },
    )
  }
  const body = await request.json().catch(() => null)
  if (!body || looksLikeSpam(body)) {
    return NextResponse.json({ ok: false, errors: { form: 'Envoi refusé.' } }, { status: 400 })
  }
  const result = await createParticipation(body)
  return NextResponse.json(result, { status: result.ok ? 201 : result.status })
}
