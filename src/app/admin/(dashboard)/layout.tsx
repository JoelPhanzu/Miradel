import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { ArrowSquareOut, SignOut } from '@phosphor-icons/react/ssr'
import { AdminBottomNav, AdminSidebar } from '@/components/admin/AdminNav'
import { logout } from '@/lib/auth/actions'
import { getCurrentUser } from '@/lib/auth/session'

export const metadata: Metadata = {
  title: { default: 'Administration', template: '%s | Admin MIRADEL' },
  robots: { index: false, follow: false },
}

async function CurrentUser() {
  const user = await getCurrentUser()
  if (!user) return null
  return (
    <div className="border-line border-t pt-4">
      <p className="truncate text-sm font-semibold">{user.fullName}</p>
      <p className="text-ink-soft truncate text-xs">{user.email}</p>
    </div>
  )
}

export default function AdminLayout({ children }: LayoutProps<'/admin'>) {
  return (
    <div className="min-h-dvh">
      <header className="border-line bg-cream/95 sticky top-0 z-30 flex h-14 items-center justify-between border-b px-4 backdrop-blur md:hidden">
        <Link href="/admin" className="font-display text-xl font-semibold">
          MIRADEL <span className="text-ink-soft text-sm font-normal">admin</span>
        </Link>
        <Link
          href="/"
          target="_blank"
          className="text-ink-soft flex min-h-11 items-center gap-1 text-sm"
        >
          Voir le site
          <ArrowSquareOut size={16} aria-hidden />
        </Link>
      </header>

      <aside className="border-line bg-cream fixed inset-y-0 left-0 hidden w-64 flex-col gap-6 overflow-y-auto border-r p-4 md:flex">
        <Link href="/admin" className="font-display px-3 text-2xl font-semibold">
          MIRADEL <span className="text-ink-soft text-sm font-normal">admin</span>
        </Link>
        <Suspense fallback={<div className="grow" />}>
          <AdminSidebar />
        </Suspense>
        <div className="mt-auto grid gap-3 px-3">
          <Link href="/" target="_blank" className="text-ink-soft flex items-center gap-2 text-sm">
            <ArrowSquareOut size={16} aria-hidden />
            Voir le site
          </Link>
          <form action={logout}>
            <button type="submit" className="text-ink-soft flex items-center gap-2 text-sm">
              <SignOut size={16} aria-hidden />
              Se déconnecter
            </button>
          </form>
          <Suspense fallback={null}>
            <CurrentUser />
          </Suspense>
        </div>
      </aside>

      <main className="pb-[68px] md:pb-0 md:pl-64">
        <Suspense
          fallback={
            <div className="mx-auto max-w-3xl px-4 pt-10 md:px-8" aria-busy>
              <div className="bg-cream-deep h-10 w-56 animate-pulse rounded-xl" />
              <div className="bg-cream-deep mt-8 h-64 animate-pulse rounded-3xl" />
            </div>
          }
        >
          {children}
        </Suspense>
      </main>

      <Suspense fallback={null}>
        <AdminBottomNav />
      </Suspense>
    </div>
  )
}
