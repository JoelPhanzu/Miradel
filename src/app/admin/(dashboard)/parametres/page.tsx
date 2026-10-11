import type { Metadata } from 'next'
import { eq } from 'drizzle-orm'
import {
  AdminForm,
  FormSection,
  ListField,
  TextAreaField,
  TextField,
} from '@/components/admin/form'
import { PaymentNumbersField } from '@/components/admin/PaymentNumbersField'
import { AdminPage } from '@/components/admin/ui'
import { getDb, schema } from '@/db'
import { seedSettings } from '@/db/seed-data'
import { requireUser } from '@/lib/auth/session'
import { formatPhone } from '@/lib/format'
import { saveSettings } from './actions'

export const metadata: Metadata = { title: 'Coordonnées et paiement' }

const SOCIALS = [
  ['facebook', 'Facebook'],
  ['instagram', 'Instagram'],
  ['tiktok', 'TikTok'],
  ['youtube', 'YouTube'],
  ['linkedin', 'LinkedIn'],
  ['x', 'X (Twitter)'],
] as const

/** Montant stocké -> texte saisi (« 5 000 » FC, « 12,50 » USD). */
const shown = (amount: number, currency: 'CDF' | 'USD') =>
  currency === 'USD'
    ? (amount / 100).toLocaleString('fr-FR', { minimumFractionDigits: 2 })
    : amount.toLocaleString('fr-FR')

export default async function SettingsPage() {
  await requireUser()
  const [row] = await getDb().select().from(schema.settings).where(eq(schema.settings.id, 1))
  const s = row ?? { ...seedSettings, usdToCdfRate: null }
  const amounts = (currency: 'CDF' | 'USD') =>
    s.donationAmounts.filter((a) => a.currency === currency).map((a) => shown(a.amount, currency))

  return (
    <AdminPage
      title="Coordonnées et paiement"
      description="Ces informations apparaissent sur tout le site : pied de page, contact, transparence, dons, boutons WhatsApp."
    >
      <AdminForm action={saveSettings}>
        <FormSection title="La fondation">
          <TextField
            name="organizationName"
            label="Nom de la fondation"
            defaultValue={s.organizationName}
          />
          <TextField name="acronym" label="Sigle" defaultValue={s.acronym} />
          <TextField name="tagline" label="Mission en une phrase" defaultValue={s.tagline} />
          <TextField
            name="legalStatus"
            label="Statut juridique"
            defaultValue={s.legalStatus}
            hint="Ex. association sans but lucratif (ASBL). Affiché sur les pages Fondation et Transparence."
          />
          <TextField
            name="registrationNumber"
            label="Numéro d’enregistrement / agrément"
            defaultValue={s.registrationNumber}
          />
          <TextAreaField name="address" label="Adresse du siège" defaultValue={s.address} rows={2} />
          <TextField
            name="googleMapsUrl"
            label="Lien Google Maps"
            type="url"
            defaultValue={s.googleMapsUrl}
            hint="Dans Google Maps : Partager > Copier le lien."
          />
        </FormSection>

        <FormSection title="Contact">
          <TextField
            name="whatsappNumber"
            label="Numéro WhatsApp (commandes, dons, contact)"
            type="tel"
            inputMode="tel"
            defaultValue={formatPhone(`+${s.whatsappNumber}`)}
            hint="Tous les boutons WhatsApp du site envoient vers ce numéro."
          />
          <TextField
            name="phone"
            label="Téléphone affiché"
            type="tel"
            inputMode="tel"
            defaultValue={s.phone ? formatPhone(s.phone) : ''}
          />
          <ListField
            name="emails"
            label="Adresses e-mail"
            defaultValue={s.emails}
            addLabel="Ajouter une adresse"
            placeholder="contact@miradel.org"
          />
        </FormSection>

        <FormSection title="Réseaux sociaux">
          <p className="text-ink-soft -mt-2 text-sm">
            Laissez vide un réseau que la fondation n&apos;utilise pas : il n&apos;apparaît pas sur
            le site.
          </p>
          {SOCIALS.map(([key, label]) => (
            <TextField
              key={key}
              name={`social_${key}`}
              label={label}
              type="url"
              defaultValue={s.socialLinks[key]}
            />
          ))}
        </FormSection>

        <FormSection title="Numéros mobile money (boutique et dons)">
          <PaymentNumbersField defaultValue={s.paymentNumbers} />
        </FormSection>

        <FormSection title="Coordonnées bancaires">
          <TextAreaField
            name="bankDetails"
            label="Banque, titulaire, numéro de compte, code SWIFT…"
            defaultValue={s.bankDetails}
            rows={5}
            hint="Affichées sur la page « Faire un don » et pour les paiements par virement."
          />
        </FormSection>

        <FormSection title="Montants de don suggérés">
          <ListField
            name="donation_CDF"
            label="En francs congolais (FC)"
            defaultValue={amounts('CDF')}
            addLabel="Ajouter un montant"
            placeholder="10 000"
          />
          <ListField
            name="donation_USD"
            label="En dollars (USD)"
            defaultValue={amounts('USD')}
            addLabel="Ajouter un montant"
            placeholder="25"
          />
        </FormSection>

        <FormSection title="Devise">
          <TextField
            name="usdToCdfRate"
            label="Taux indicatif : 1 USD = … FC"
            inputMode="numeric"
            defaultValue={s.usdToCdfRate}
            hint="Facultatif. Saisi à la main, jamais mis à jour automatiquement."
          />
        </FormSection>
      </AdminForm>
    </AdminPage>
  )
}
