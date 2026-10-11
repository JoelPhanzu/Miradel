'use server'

import { eq } from 'drizzle-orm'
import { getDb, schema } from '@/db'
import { PAGE_SECTIONS } from '@/lib/admin/sections'
import {
  audit,
  failure,
  optionalText,
  refresh,
  success,
  type ActionState,
} from '@/lib/admin/server'
import { requireUser } from '@/lib/auth/session'
import { CACHE_TAGS } from '@/lib/data/public'

export async function saveSection(
  key: string,
  _state: ActionState,
  fd: FormData,
): Promise<ActionState> {
  const user = await requireUser()
  if (!PAGE_SECTIONS.some((s) => s.key === key)) return failure({}, 'Section inconnue')

  const buttonHref = optionalText(fd, 'buttonHref')
  if (buttonHref && !buttonHref.startsWith('/') && !buttonHref.startsWith('https://')) {
    return failure({ buttonHref: 'Lien du site (ex. /sengager) ou adresse https://' })
  }
  const values = {
    title: optionalText(fd, 'title'),
    body: optionalText(fd, 'body'),
    imageUrl: optionalText(fd, 'imageUrl'),
    secondaryImageUrl: optionalText(fd, 'secondaryImageUrl'),
    buttonLabel: optionalText(fd, 'buttonLabel'),
    buttonHref,
  }

  const db = getDb()
  const [before] = await db
    .select()
    .from(schema.pageSections)
    .where(eq(schema.pageSections.key, key))
  if (before)
    await db.update(schema.pageSections).set(values).where(eq(schema.pageSections.key, key))
  else await db.insert(schema.pageSections).values({ key, ...values })

  await audit(
    'page_sections',
    before?.id ?? null,
    before ? 'UPDATE' : 'INSERT',
    user.id,
    before ?? null,
    values,
  )
  refresh([CACHE_TAGS.pageSections], '/admin/pages')
  return success()
}
