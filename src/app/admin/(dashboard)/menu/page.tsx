import Link from 'next/link'
import { CaretRight, SignOut } from '@phosphor-icons/react/ssr'
import { ADMIN_NAV } from '@/components/admin/nav'
import { AdminPage } from '@/components/admin/ui'
import { logout } from '@/lib/auth/actions'
import { MANAGER_ROLES, requireUser } from '@/lib/auth/session'

/** Menu complet (téléphone). */
export default async function MenuPage() {
  const user = await requireUser()
  const isManager = MANAGER_ROLES.includes(user.role)
  const groups = [...new Set(ADMIN_NAV.map((i) => i.group))]

  return (
    <AdminPage title="Menu">
      <div className="grid gap-8">
        {groups.map((group) => (
          <section key={group}>
            <h2 className="text-ink-soft text-xs font-semibold tracking-[0.14em] uppercase">
              {group}
            </h2>
            <ul className="divide-line border-line mt-3 divide-y rounded-3xl border">
              {ADMIN_NAV.filter((i) => i.group === group)
                .filter((i) => !('managersOnly' in i) || isManager)
                .map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="flex min-h-14 items-center justify-between px-4 font-semibold"
                    >
                      {item.label}
                      <CaretRight size={18} className="text-ink-soft" aria-hidden />
                    </Link>
                  </li>
                ))}
            </ul>
          </section>
        ))}
        <form action={logout}>
          <button
            type="submit"
            className="border-line flex min-h-12 w-full items-center justify-center gap-2 rounded-full border font-semibold"
          >
            <SignOut size={18} aria-hidden />
            Se déconnecter ({user.fullName})
          </button>
        </form>
      </div>
    </AdminPage>
  )
}
