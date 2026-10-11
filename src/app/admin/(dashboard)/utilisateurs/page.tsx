import type { Metadata } from 'next'
import { asc } from 'drizzle-orm'
import { AdminPage, Badge, ListCard, ListRow } from '@/components/admin/ui'
import { getDb, schema } from '@/db'
import { ROLE_LABELS } from '@/lib/admin/labels'
import { MANAGER_ROLES, requireUser } from '@/lib/auth/session'

export const metadata: Metadata = { title: 'Utilisateurs' }

export default async function UsersPage() {
  await requireUser(MANAGER_ROLES)
  const rows = await getDb()
    .select({
      id: schema.users.id,
      fullName: schema.users.fullName,
      email: schema.users.email,
      role: schema.users.role,
      isActive: schema.users.isActive,
    })
    .from(schema.users)
    .orderBy(asc(schema.users.fullName))

  return (
    <AdminPage
      title="Utilisateurs"
      description="Les personnes qui peuvent se connecter à cet espace."
      action={{ href: '/admin/utilisateurs/nouveau', label: 'Ajouter' }}
    >
      <ListCard>
        {rows.map((u) => (
          <li key={u.id}>
            <ListRow
              href={`/admin/utilisateurs/${u.id}`}
              title={u.fullName}
              subtitle={u.email}
              aside={
                <>
                  <Badge>{ROLE_LABELS[u.role]}</Badge>
                  {!u.isActive && <Badge tone="muted">Désactivé</Badge>}
                </>
              }
            />
          </li>
        ))}
      </ListCard>
    </AdminPage>
  )
}
