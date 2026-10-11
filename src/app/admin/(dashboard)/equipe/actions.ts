'use server'

import { eq } from 'drizzle-orm'
import { getDb, schema } from '@/db'
import { moveItem, nextPosition } from '@/lib/admin/reorder'
import {
  audit,
  checked,
  failure,
  optionalText,
  refresh,
  success,
  text,
  type ActionState,
} from '@/lib/admin/server'
import { requireUser } from '@/lib/auth/session'
import { CACHE_TAGS } from '@/lib/data/public'

const TAGS = [CACHE_TAGS.team]

export async function saveMember(
  id: string | null,
  _state: ActionState,
  fd: FormData,
): Promise<ActionState> {
  const user = await requireUser()
  const errors: Record<string, string> = {}
  const fullName = text(fd, 'fullName')
  if (!fullName) errors.fullName = 'Indiquez le nom'
  const role = text(fd, 'role')
  if (!role) errors.role = 'Indiquez la fonction'
  if (Object.keys(errors).length) return failure(errors)

  const values = {
    fullName,
    role,
    photoUrl: optionalText(fd, 'photoUrl'),
    bio: optionalText(fd, 'bio'),
    isPublished: checked(fd, 'isPublished'),
  }
  const db = getDb()
  if (id) {
    const [before] = await db
      .select()
      .from(schema.teamMembers)
      .where(eq(schema.teamMembers.id, id))
    if (!before) return failure({}, 'Personne introuvable')
    await db.update(schema.teamMembers).set(values).where(eq(schema.teamMembers.id, id))
    await audit('team_members', id, 'UPDATE', user.id, before, values)
    refresh(TAGS, '/admin/equipe')
    return success()
  }
  const newId = crypto.randomUUID()
  await db
    .insert(schema.teamMembers)
    .values({ ...values, id: newId, position: await nextPosition(schema.teamMembers) })
  await audit('team_members', newId, 'INSERT', user.id, null, values)
  refresh(TAGS, '/admin/equipe')
  return success('Personne ajoutée', newId)
}

export async function deleteMember(id: string): Promise<ActionState> {
  const user = await requireUser()
  const db = getDb()
  const [before] = await db.select().from(schema.teamMembers).where(eq(schema.teamMembers.id, id))
  await db.delete(schema.teamMembers).where(eq(schema.teamMembers.id, id))
  await audit('team_members', id, 'DELETE', user.id, before ?? null, null)
  refresh(TAGS, '/admin/equipe')
  return success('Personne retirée')
}

export async function moveMember(id: string, direction: 'up' | 'down'): Promise<void> {
  await requireUser()
  if (await moveItem(schema.teamMembers, id, direction)) refresh(TAGS)
}
