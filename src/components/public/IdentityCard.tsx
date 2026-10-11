import type { SiteSettings } from '@/types/content'
import { OrToComplete } from './ToComplete'

/**
 * Identité de la fondation : statut juridique, enregistrement, siège.
 * Ce qui manque reste visiblement « [À COMPLÉTER] » : rien n'est inventé.
 */
export function IdentityCard({ settings }: { settings: SiteSettings }) {
  const rows = [
    ['Nom', settings.organizationName],
    ['Sigle', settings.acronym],
    ['Statut juridique', settings.legalStatus],
    ['Enregistrement / agrément', settings.registrationNumber],
    ['Siège', settings.address],
  ] as const
  return (
    <dl className="divide-line border-line divide-y border-y">
      {rows.map(([label, value]) => (
        <div key={label} className="grid gap-1 py-4 sm:grid-cols-[14rem_1fr] sm:gap-6">
          <dt className="text-ink-soft text-sm font-semibold">{label}</dt>
          <dd>
            <OrToComplete value={value} />
          </dd>
        </div>
      ))}
    </dl>
  )
}
