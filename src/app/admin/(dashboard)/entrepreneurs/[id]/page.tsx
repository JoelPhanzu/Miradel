import Link from 'next/link'
import { asc, eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { ArrowSquareOut, Plus } from '@phosphor-icons/react/ssr'
import {
  AdminForm,
  DeleteButton,
  FormSection,
  ImageField,
  SelectField,
  TextAreaField,
  TextField,
  ToggleField,
} from '@/components/admin/form'
import { AdminPage } from '@/components/admin/ui'
import { getDb, schema } from '@/db'
import { requireUser } from '@/lib/auth/session'
import { deleteEntrepreneur, saveEntrepreneur } from '../actions'

/** /admin/entrepreneurs/nouveau ou /admin/entrepreneurs/<id> */
export default async function EntrepreneurAdminPage({
  params,
}: PageProps<'/admin/entrepreneurs/[id]'>) {
  await requireUser()
  const { id } = await params
  const isNew = id === 'nouveau'
  const db = getDb()
  const [rows, sectors, programs] = await Promise.all([
    isNew ? [] : db.select().from(schema.entrepreneurs).where(eq(schema.entrepreneurs.id, id)),
    db
      .select({ id: schema.sectors.id, name: schema.sectors.name })
      .from(schema.sectors)
      .orderBy(asc(schema.sectors.position)),
    db
      .select({ id: schema.programs.id, title: schema.programs.title })
      .from(schema.programs)
      .orderBy(asc(schema.programs.position)),
  ])
  const e = rows[0]
  if (!isNew && !e) notFound()

  return (
    <AdminPage
      title={e?.name ?? 'Nouvelle vitrine'}
      description={
        e?.isFoundation
          ? 'Vitrine de la fondation : ses produits se commandent avec le panier.'
          : undefined
      }
      back={{ href: '/admin/entrepreneurs', label: 'Entrepreneurs' }}
    >
      {e && (
        <div className="mb-6 flex flex-wrap gap-x-6">
          <Link
            href={`/vitrine/${e.slug}`}
            target="_blank"
            className="text-accent inline-flex min-h-11 items-center gap-2 text-sm font-semibold"
          >
            Voir sur le site
            <ArrowSquareOut size={16} aria-hidden />
          </Link>
          <Link
            href="/admin/produits/nouveau"
            className="text-accent inline-flex min-h-11 items-center gap-2 text-sm font-semibold"
          >
            <Plus size={16} aria-hidden />
            Ajouter un produit (choisir « Vendu par : {e.name} »)
          </Link>
        </div>
      )}
      <AdminForm
        action={saveEntrepreneur.bind(null, e?.id ?? null)}
        submitLabel={e ? 'Enregistrer' : 'Créer la vitrine'}
        redirectBase="/admin/entrepreneurs"
      >
        <FormSection title="Affichage">
          <ToggleField
            name="isPublished"
            label="Publier la vitrine"
            description="Masquée, la vitrine et ses produits disparaissent du site."
            defaultChecked={e?.isPublished ?? false}
          />
          <ToggleField
            name="isFeatured"
            label="Mettre en avant"
            description="Affichée sur la page d’accueil (3 vitrines au plus)."
            defaultChecked={e?.isFeatured ?? false}
          />
        </FormSection>

        <FormSection title="Présentation">
          <TextField
            name="name"
            label="Nom de l’activité ou de la boutique"
            defaultValue={e?.name}
          />
          {!e?.isFoundation && (
            <>
              <TextField
                name="ownerName"
                label="Porteur ou porteuse de projet (facultatif)"
                defaultValue={e?.ownerName}
                hint="Nom affiché seulement si la personne l’accepte."
              />
              <SelectField
                name="sectorId"
                label="Secteur d’activité"
                defaultValue={e?.sectorId}
                emptyLabel="Sans secteur (Autres activités)"
                options={sectors.map((s) => ({ value: s.id, label: s.name }))}
                hint="Les secteurs se créent dans « Secteurs d’activité »."
              />
              <SelectField
                name="programId"
                label="Accompagné dans le programme (facultatif)"
                defaultValue={e?.programId}
                emptyLabel="Aucun"
                options={programs.map((p) => ({ value: p.id, label: p.title }))}
              />
            </>
          )}
          <TextField
            name="tagline"
            label="Phrase de présentation (facultatif)"
            defaultValue={e?.tagline}
            hint="Une phrase, ex. ce qu’il ou elle fabrique et depuis quand."
          />
          <TextAreaField
            name="story"
            label="Son histoire (facultatif)"
            defaultValue={e?.story}
            rows={8}
            hint="Paragraphes séparés par une ligne vide. Uniquement des faits fournis par la personne."
          />
          <TextField
            name="location"
            label="Commune / ville (facultatif)"
            defaultValue={e?.location}
          />
        </FormSection>

        <FormSection title="Photos">
          <ImageField
            name="coverImageUrl"
            label="Photo de l’activité"
            defaultValue={e?.coverImageUrl}
            aspect="aspect-[4/3]"
            hint="Atelier, produits, personne au travail. Photo réelle uniquement."
          />
          {!e?.isFoundation && (
            <>
              <ImageField
                name="photoUrl"
                label="Portrait (facultatif)"
                defaultValue={e?.photoUrl}
                aspect="aspect-square"
              />
              <ToggleField
                name="photoConsent"
                label="Autorisation de diffusion obtenue"
                description="Sans cette case, le portrait n’est jamais affiché."
                defaultChecked={e?.photoConsent ?? false}
              />
            </>
          )}
        </FormSection>

        {!e?.isFoundation && (
          <FormSection title="Contact">
            <TextField
              name="whatsappNumber"
              label="Numéro WhatsApp de l’entrepreneur (facultatif)"
              type="tel"
              inputMode="tel"
              defaultValue={e?.whatsappNumber ? `+${e.whatsappNumber}` : ''}
              hint="Les clients lui écrivent directement. Vide : les demandes arrivent sur le WhatsApp de la fondation."
            />
            <TextField
              name="facebookUrl"
              label="Page Facebook (facultatif)"
              type="url"
              defaultValue={e?.facebookUrl}
            />
          </FormSection>
        )}
      </AdminForm>
      {e && !e.isFoundation && (
        <DeleteButton
          action={deleteEntrepreneur.bind(null, e.id)}
          redirectTo="/admin/entrepreneurs"
          label="Supprimer la vitrine"
        />
      )}
    </AdminPage>
  )
}
