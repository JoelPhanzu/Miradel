import { asc, eq } from 'drizzle-orm'
import {
  AdminForm,
  DeleteButton,
  FormSection,
  ImageField,
  TextAreaField,
  TextField,
  ToggleField,
} from '@/components/admin/form'
import { PromotionRules } from '@/components/admin/PromotionRules'
import { getDb, schema } from '@/db'
import { toKinshasaLocal } from '@/lib/admin/kinshasa-time'
import { deletePromotion, savePromotion } from './actions'

type Promotion = typeof schema.promotions.$inferSelect

export async function PromotionForm({ promotion }: { promotion?: Promotion }) {
  const db = getDb()
  const [productCategories, products, targets] = await Promise.all([
    db
      .select({ id: schema.productCategories.id, name: schema.productCategories.name })
      .from(schema.productCategories)
      .orderBy(asc(schema.productCategories.position)),
    db
      .select({
        id: schema.products.id,
        name: schema.products.name,
        categoryId: schema.products.categoryId,
        priceAmount: schema.products.priceAmount,
      })
      .from(schema.products)
      .orderBy(asc(schema.products.position)),
    promotion
      ? db
          .select({
            targetType: schema.promotionTargets.targetType,
            targetId: schema.promotionTargets.targetId,
          })
          .from(schema.promotionTargets)
          .where(eq(schema.promotionTargets.promotionId, promotion.id))
      : Promise.resolve([]),
  ])

  return (
    <>
      <AdminForm
        action={savePromotion.bind(null, promotion?.id ?? null)}
        submitLabel={promotion ? 'Enregistrer' : 'Créer la promotion'}
        redirectBase={`/admin/promotions`}
      >
        <FormSection title="Activation">
          <ToggleField
            name="isActive"
            label="Promotion active"
            description="Décochez pour la suspendre sans la supprimer."
            defaultChecked={promotion?.isActive ?? true}
          />
          <ToggleField
            name="showBanner"
            label="Bandeau en haut du site"
            description="Affiche « Aujourd'hui : … » les jours où la promotion s'applique."
            defaultChecked={promotion?.showBanner ?? false}
          />
        </FormSection>

        <FormSection title="Présentation">
          <TextField name="title" label="Nom de la promotion" defaultValue={promotion?.title} />
          <TextField
            name="subtitle"
            label="Accroche"
            defaultValue={promotion?.subtitle}
            hint="Ex. « -10 % sur les produits d'hygiène »"
          />
          <TextAreaField
            name="description"
            label="Détails"
            defaultValue={promotion?.description}
            rows={3}
          />
          <TextField
            name="badge"
            label="Étiquette"
            defaultValue={promotion?.badge}
            hint="Ex. « -10 % », « Nouveauté »"
          />
        </FormSection>

        <PromotionRules
          defaults={{
            discountType: promotion?.discountType ?? 'percentage',
            discountValue: promotion?.discountValue ?? 0,
            scope: promotion?.scope ?? 'all_products',
            targets,
            weekdays: promotion?.weekdays ?? [],
            minQuantity: promotion?.minQuantity ?? null,
          }}
          productCategories={productCategories}
          products={products}
        />

        <FormSection title="4. Période (facultative)">
          <p className="text-ink-soft -mt-2 text-sm">
            Heure de Kinshasa. Laissez vide pour une promotion sans date de fin.
          </p>
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              name="startsAt"
              label="Début"
              type="datetime-local"
              defaultValue={toKinshasaLocal(promotion?.startsAt)}
            />
            <TextField
              name="endsAt"
              label="Fin"
              type="datetime-local"
              defaultValue={toKinshasaLocal(promotion?.endsAt)}
            />
          </div>
        </FormSection>

        <FormSection title="5. Bannière et bouton">
          <ImageField
            name="bannerUrl"
            label="Image de la promotion"
            defaultValue={promotion?.bannerUrl}
            aspect="aspect-video"
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              name="ctaLabel"
              label="Texte du bouton"
              defaultValue={promotion?.ctaLabel ?? 'Voir la boutique'}
            />
            <TextField
              name="ctaHref"
              label="Lien du bouton"
              defaultValue={promotion?.ctaHref ?? '/boutique'}
              hint="/boutique ou /promotions"
            />
          </div>
          <TextField
            name="priority"
            label="Priorité"
            inputMode="numeric"
            defaultValue={promotion?.priority ?? 0}
            hint="Si deux promotions donnent le même prix, la priorité la plus haute l'emporte."
          />
        </FormSection>
      </AdminForm>

      {promotion && (
        <DeleteButton
          action={deletePromotion.bind(null, promotion.id)}
          redirectTo="/admin/promotions"
          label="Supprimer la promotion"
        />
      )}
    </>
  )
}
