import Link from 'next/link'
import { asc, eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { ArrowSquareOut } from '@phosphor-icons/react/ssr'
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
import { toKinshasaLocal } from '@/lib/admin/kinshasa-time'
import { requireUser } from '@/lib/auth/session'
import { deletePost, savePost } from '../actions'

const FORMAT_HELP =
  'Une ligne vide entre deux paragraphes. « ## » au début d’une ligne pour un titre, « - » pour une liste, **gras**, *italique*.'

/** /admin/actualites/nouveau ou /admin/actualites/<id> */
export default async function PostPage({ params }: PageProps<'/admin/actualites/[id]'>) {
  await requireUser()
  const { id } = await params
  const isNew = id === 'nouveau'
  const db = getDb()
  const [[post], programs] = await Promise.all([
    isNew
      ? Promise.resolve([undefined])
      : db.select().from(schema.posts).where(eq(schema.posts.id, id)),
    db
      .select({ id: schema.programs.id, title: schema.programs.title })
      .from(schema.programs)
      .orderBy(asc(schema.programs.position)),
  ])
  if (!isNew && !post) notFound()

  return (
    <AdminPage
      title={post?.title ?? 'Nouvelle actualité'}
      back={{ href: '/admin/actualites', label: 'Actualités' }}
    >
      {post?.publishedAt && (
        <Link
          href={`/actualites/${post.slug}`}
          target="_blank"
          className="text-accent mb-6 inline-flex min-h-11 items-center gap-2 text-sm font-semibold"
        >
          Voir sur le site
          <ArrowSquareOut size={16} aria-hidden />
        </Link>
      )}
      <AdminForm
        action={savePost.bind(null, post?.id ?? null)}
        submitLabel={post ? 'Enregistrer' : 'Créer l’actualité'}
        redirectBase={`/admin/actualites`}
      >
        <FormSection title="Publication">
          <ToggleField
            name="published"
            label="Publier"
            description="Décoché : l'actualité reste en brouillon, invisible sur le site."
            defaultChecked={Boolean(post?.publishedAt)}
          />
          <TextField
            name="publishedAt"
            label="Date de publication"
            type="datetime-local"
            defaultValue={toKinshasaLocal(post?.publishedAt)}
            hint="Date de l’action ou de la publication. Vide = maintenant. Une date future programme la publication."
          />
        </FormSection>
        <FormSection title="Actualité">
          <TextField name="title" label="Titre" defaultValue={post?.title} />
          <TextAreaField name="excerpt" label="Résumé" defaultValue={post?.excerpt} rows={2} />
          <ImageField
            name="imageUrl"
            label="Image"
            defaultValue={post?.imageUrl}
            aspect="aspect-[4/3]"
            hint="Photo réelle de l’action, avec l’accord des personnes photographiées."
          />
          <TextAreaField
            name="content"
            label="Texte"
            defaultValue={post?.content}
            rows={14}
            hint={FORMAT_HELP}
          />
          <SelectField
            name="programId"
            label="Programme concerné"
            defaultValue={post?.programId}
            emptyLabel="Aucun"
            options={programs.map((p) => ({ value: p.id, label: p.title }))}
          />
        </FormSection>
        <FormSection title="Référencement Google (facultatif)">
          <TextField name="seoTitle" label="Titre pour Google" defaultValue={post?.seoTitle} />
          <TextAreaField
            name="seoDescription"
            label="Description pour Google"
            defaultValue={post?.seoDescription}
            rows={2}
          />
        </FormSection>
      </AdminForm>
      {post && (
        <DeleteButton
          action={deletePost.bind(null, post.id)}
          redirectTo="/admin/actualites"
          label="Supprimer l'actualité"
        />
      )}
    </AdminPage>
  )
}
