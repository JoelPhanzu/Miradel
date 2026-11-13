'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { getDb, schema } from '@/db'
import { MESSAGE_STATUSES } from '@/db/schema'
import { parseKinshasaLocal } from '@/lib/admin/kinshasa-time'
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
import { checkFieldDefs, sanitizeFieldDefs } from '@/lib/program-forms'

const TAGS = [CACHE_TAGS.programForms]

export async function saveProgramForm(
  id: string | null,
  _state: ActionState,
  fd: FormData,
): Promise<ActionState> {
  const user = await requireUser()
  const errors: Record<string, string> = {}
  const title = text(fd, 'title')
  if (!title) errors.title = 'Indiquez le titre du formulaire'
  const programId = text(fd, 'programId')
  if (!programId) errors.programId = 'Choisissez le programme concerné'
  const closesAt = parseKinshasaLocal(text(fd, 'closesAt'))
  if (!closesAt) errors.closesAt = 'Indiquez la date et l’heure limites'
  let fields: ReturnType<typeof sanitizeFieldDefs> = []
  try {
    fields = sanitizeFieldDefs(JSON.parse(text(fd, 'fields') || '[]'))
  } catch {
    errors.fields = 'Champs illisibles : rechargez la page'
  }
  const fieldsError = checkFieldDefs(fields)
  if (fieldsError) errors.fields = fieldsError
  if (Object.keys(errors).length) return failure(errors)

  const values = {
    title,
    programId,
    intro: optionalText(fd, 'intro'),
    closesAt,
    successMessage: optionalText(fd, 'successMessage'),
    fields,
    isPublished: checked(fd, 'isPublished'),
  }
  const db = getDb()
  if (id) {
    const [before] = await db
      .select()
      .from(schema.programForms)
      .where(eq(schema.programForms.id, id))
    if (!before) return failure({}, 'Formulaire introuvable')
    await db.update(schema.programForms).set(values).where(eq(schema.programForms.id, id))
    await audit('program_forms', id, 'UPDATE', user.id, before, values)
    refresh(TAGS, '/admin/formulaires')
    return success()
  }
  const newId = crypto.randomUUID()
  await db
    .insert(schema.programForms)
    .values({ ...values, id: newId, position: await nextPosition(schema.programForms) })
  await audit('program_forms', newId, 'INSERT', user.id, null, values)
  refresh(TAGS, '/admin/formulaires')
  return success('Formulaire créé', newId)
}

/** Supprime le formulaire ET ses réponses. */
export async function deleteProgramForm(id: string): Promise<ActionState> {
  const user = await requireUser()
  const db = getDb()
  const [before] = await db.select().from(schema.programForms).where(eq(schema.programForms.id, id))
  await db.delete(schema.programForms).where(eq(schema.programForms.id, id))
  await audit('program_forms', id, 'DELETE', user.id, before ?? null, null)
  refresh(TAGS, '/admin/formulaires')
  return success('Formulaire supprimé')
}

export async function moveProgramForm(id: string, direction: 'up' | 'down'): Promise<void> {
  await requireUser()
  if (await moveItem(schema.programForms, id, direction)) refresh(TAGS)
}

type Status = (typeof MESSAGE_STATUSES)[number]

export async function setResponseStatus(id: string, status: Status): Promise<ActionState> {
  const user = await requireUser()
  if (!MESSAGE_STATUSES.includes(status)) return failure({}, 'Statut inconnu')
  const db = getDb()
  const [before] = await db
    .select({
      status: schema.programFormResponses.status,
      formId: schema.programFormResponses.formId,
    })
    .from(schema.programFormResponses)
    .where(eq(schema.programFormResponses.id, id))
  if (!before) return failure({}, 'Réponse introuvable')
  await db
    .update(schema.programFormResponses)
    .set({ status })
    .where(eq(schema.programFormResponses.id, id))
  await audit(
    'program_form_responses',
    id,
    'UPDATE',
    user.id,
    { status: before.status },
    { status },
  )
  revalidatePath(`/admin/formulaires/${before.formId}/reponses`)
  revalidatePath('/admin')
  return success()
}

/** Suppression définitive (données personnelles). */
export async function deleteResponse(id: string): Promise<ActionState> {
  const user = await requireUser()
  const db = getDb()
  const [before] = await db
    .select({ formId: schema.programFormResponses.formId })
    .from(schema.programFormResponses)
    .where(eq(schema.programFormResponses.id, id))
  await db.delete(schema.programFormResponses).where(eq(schema.programFormResponses.id, id))
  await audit('program_form_responses', id, 'DELETE', user.id, null, null)
  if (before) revalidatePath(`/admin/formulaires/${before.formId}/reponses`)
  return success('Réponse supprimée')
}
