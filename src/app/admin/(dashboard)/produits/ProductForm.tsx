import Link from 'next/link'
import { ArrowSquareOut } from '@phosphor-icons/react/ssr'
import {
  AdminForm,
  DeleteButton,
  FormSection,
  ImagesField,
  PriceField,
  SelectField,
  TextAreaField,
  TextField,
  ToggleField,
} from '@/components/admin/form'
import { VariantsField } from '@/components/admin/VariantsField'
import type { products } from '@/db/schema'
import { deleteProduct, saveProduct } from './actions'

type Product = typeof products.$inferSelect

export function ProductForm({
  product,
  categories,
  programs,
}: {
  product?: Product
  categories: { id: string; name: string }[]
  programs: { id: string; title: string }[]
}) {
  return (
    <>
      {product && (
        <Link
          href={`/produits/${product.slug}`}
          target="_blank"
          className="text-accent mb-6 inline-flex min-h-11 items-center gap-2 text-sm font-semibold"
        >
          Voir sur le site
          <ArrowSquareOut size={16} aria-hidden />
        </Link>
      )}
      <AdminForm
        action={saveProduct.bind(null, product?.id ?? null)}
        submitLabel={product ? 'Enregistrer' : 'Créer le produit'}
        redirectBase={`/admin/produits`}
      >
        <FormSection title="Affichage">
          <ToggleField
            name="isPublished"
            label="Publier dans la boutique"
            description="Décochez pour masquer le produit sans le supprimer."
            defaultChecked={product?.isPublished ?? true}
          />
          <ToggleField
            name="isFeatured"
            label="Mettre en avant"
            description="Affiché sur la page d’accueil."
            defaultChecked={product?.isFeatured ?? false}
          />
        </FormSection>

        <FormSection title="Fiche produit">
          <TextField name="name" label="Nom du produit" defaultValue={product?.name} />
          <SelectField
            name="categoryId"
            label="Catégorie"
            defaultValue={product?.categoryId}
            emptyLabel="Sans catégorie"
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
          />
          <TextField
            name="packaging"
            label="Contenance / conditionnement"
            defaultValue={product?.packaging}
            hint="Ex. « Bidon de 1 L », « Pot de 250 g »"
          />
          <TextAreaField name="description" label="Description" defaultValue={product?.description} />
          <TextAreaField
            name="composition"
            label="Ingrédients ou composition"
            defaultValue={product?.composition}
            rows={3}
          />
          <TextAreaField
            name="usageTips"
            label="Conseils d’utilisation"
            defaultValue={product?.usageTips}
            rows={3}
          />
          <SelectField
            name="programId"
            label="Fabriqué dans le cadre du programme"
            defaultValue={product?.programId}
            emptyLabel="Aucun programme précisé"
            options={programs.map((p) => ({ value: p.id, label: p.title }))}
          />
        </FormSection>

        <FormSection title="Prix">
          <SelectField
            name="currency"
            label="Devise"
            defaultValue={product?.currency ?? 'CDF'}
            options={[
              { value: 'CDF', label: 'Francs congolais (FC)' },
              { value: 'USD', label: 'Dollars américains (USD)' },
            ]}
          />
          <PriceField
            name="priceAmount"
            label="Prix de vente"
            defaultValue={product?.priceAmount}
            storedCurrency={product?.currency}
            hint="Laissez vide tant que le prix n’est pas confirmé : le produit s’affiche « Prix à confirmer » et se commande sur WhatsApp."
          />
          <PriceField
            name="compareAtAmount"
            label="Ancien prix (barré)"
            defaultValue={product?.compareAtAmount}
            storedCurrency={product?.currency}
            hint="Facultatif. Affiché barré à côté du prix de vente."
          />
        </FormSection>

        <FormSection title="Stock">
          <ToggleField
            name="trackStock"
            label="Suivre le stock"
            description="Le produit passe en « Rupture de stock » à 0."
            defaultChecked={product?.stock != null}
          />
          <TextField
            name="stock"
            label="Quantité en stock"
            inputMode="numeric"
            defaultValue={product?.stock}
            hint="Ignoré si le suivi du stock est désactivé."
          />
        </FormSection>

        <FormSection title="Variantes">
          <VariantsField defaultValue={product?.variants ?? {}} />
        </FormSection>

        <FormSection title="Photos">
          <ImagesField
            name="images"
            label="Photos du produit"
            defaultValue={product?.images}
            hint="Photo nette sur fond neutre. La première est celle affichée dans le catalogue."
          />
        </FormSection>
      </AdminForm>

      {product && (
        <DeleteButton
          action={deleteProduct.bind(null, product.id)}
          redirectTo="/admin/produits"
          label="Supprimer le produit"
        />
      )}
    </>
  )
}
