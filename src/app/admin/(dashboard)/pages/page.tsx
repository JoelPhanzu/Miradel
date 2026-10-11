import type { Metadata } from 'next'
import { AdminPage, ListCard, ListRow } from '@/components/admin/ui'
import { getDb, schema } from '@/db'
import { PAGE_SECTIONS } from '@/lib/admin/sections'
import { requireUser } from '@/lib/auth/session'

export const metadata: Metadata = { title: 'Textes et images du site' }

export default async function SectionsPage() {
  await requireUser()
  const rows = await getDb().select().from(schema.pageSections)
  const pages = [...new Set(PAGE_SECTIONS.map((s) => s.page))]

  return (
    <AdminPage
      title="Textes et images du site"
      description="Les titres, textes et photos des différentes pages."
    >
      <div className="grid gap-8">
        {pages.map((page) => (
          <section key={page}>
            <h2 className="font-display mb-3 text-2xl font-semibold">{page}</h2>
            <ListCard>
              {PAGE_SECTIONS.filter((s) => s.page === page).map((section) => {
                const row = rows.find((r) => r.key === section.key)
                return (
                  <li key={section.key}>
                    <ListRow
                      href={`/admin/pages/${section.key}`}
                      title={section.label}
                      subtitle={row?.title?.replace(/\*/g, '') ?? 'Non rempli'}
                    />
                  </li>
                )
              })}
            </ListCard>
          </section>
        ))}
      </div>
    </AdminPage>
  )
}
