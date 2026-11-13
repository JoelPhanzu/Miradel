import { MagnifyingGlass } from '@phosphor-icons/react/ssr'
import type { Category, Sector } from '@/types/content'
import { inputClass } from './form/Field'

/**
 * Recherche dans la vitrine : simple formulaire GET vers /vitrine/produits,
 * qui fonctionne même sans JavaScript (téléphones modestes, réseau lent).
 */
export function ProductSearch({
  categories,
  sectors,
  defaults = {},
}: {
  categories: Category[]
  sectors: Sector[]
  defaults?: { q?: string; categorie?: string; secteur?: string }
}) {
  return (
    <form
      action="/vitrine/produits"
      method="get"
      role="search"
      className="bg-cream border-border grid gap-3 rounded-xl border p-3 shadow-sm md:grid-cols-[1.6fr_1fr_1fr_auto] md:p-4"
    >
      <label className="relative">
        <span className="sr-only">Rechercher un produit</span>
        <MagnifyingGlass
          size={20}
          className="text-ink-soft pointer-events-none absolute top-1/2 left-4 -translate-y-1/2"
          aria-hidden
        />
        <input
          type="search"
          name="q"
          defaultValue={defaults.q}
          placeholder="Savon, couture, piment…"
          className={`${inputClass} pl-12`}
        />
      </label>
      {categories.length > 0 && (
        <label>
          <span className="sr-only">Catégorie</span>
          <select name="categorie" defaultValue={defaults.categorie ?? ''} className={inputClass}>
            <option value="">Toutes les catégories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
      )}
      {sectors.length > 0 && (
        <label>
          <span className="sr-only">Secteur d’activité</span>
          <select name="secteur" defaultValue={defaults.secteur ?? ''} className={inputClass}>
            <option value="">Tous les secteurs</option>
            {sectors.map((s) => (
              <option key={s.id} value={s.slug}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
      )}
      <button
        type="submit"
        className="text-navy-950 min-h-12 rounded-full bg-orange-500 px-8 text-sm font-bold transition hover:bg-orange-400"
      >
        Rechercher
      </button>
    </form>
  )
}
