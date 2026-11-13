/**
 * Enregistrement d'une réponse à un formulaire de participation.
 * La définition des champs et la date limite sont relues EN BASE (jamais celles du navigateur) :
 * un formulaire expiré ou masqué refuse les envois, même depuis une page restée ouverte.
 */
import 'server-only'
import { eq } from 'drizzle-orm'
import { getDb, isDatabaseConfigured, schema } from '@/db'
import { isFormOpen, validateAnswers } from '@/lib/program-forms'
import type { SimpleResult } from './checkout'

export async function createParticipation(input: unknown): Promise<SimpleResult> {
  const body = (input ?? {}) as { formId?: unknown; answers?: unknown }
  if (typeof body.formId !== 'string' || body.formId.length > 36) {
    return { ok: false, status: 400, errors: { form: 'Formulaire inconnu.' } }
  }
  if (!isDatabaseConfigured()) {
    return {
      ok: false,
      status: 503,
      errors: { form: 'Envoi indisponible. Écrivez-nous sur WhatsApp.' },
    }
  }
  try {
    const db = getDb()
    const [form] = await db
      .select()
      .from(schema.programForms)
      .where(eq(schema.programForms.id, body.formId))
    if (!form || !form.isPublished) {
      return { ok: false, status: 404, errors: { form: 'Ce formulaire n’est plus disponible.' } }
    }
    if (!isFormOpen(form, new Date())) {
      return {
        ok: false,
        status: 410,
        errors: { form: 'La date limite est passée : les inscriptions sont closes.' },
      }
    }
    const result = validateAnswers(form.fields, body.answers)
    if (!result.ok) return { ok: false, status: 422, errors: result.errors }
    await db
      .insert(schema.programFormResponses)
      .values({ formId: form.id, answers: result.answers, fields: form.fields })
    return { ok: true }
  } catch (error) {
    console.error('[participation] enregistrement impossible', error)
    return {
      ok: false,
      status: 500,
      errors: { form: 'Envoi impossible pour le moment. Réessayez ou écrivez-nous sur WhatsApp.' },
    }
  }
}
