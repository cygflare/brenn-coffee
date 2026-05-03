import Link from 'next/link';
import type { Metadata } from 'next';
import { requireAdmin } from '@/lib/auth';
import { LayoutDashboard, Package, ShoppingBag, Ticket, LogOut, ArrowUpRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Admin',
  robots: { index: false, follow: false },
};

const NAV = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Products', href: '/admin/products', icon: Package },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
  { label: 'Coupons', href: '/admin/coupons', icon: Ticket },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin('/admin');

  return (
    <div className="container-x py-6 lg:py-8">
      <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-8">
        <aside>
          <div className="mb-5">
            <div className="text-xs text-ember tracking-[0.2em] uppercase mb-1">Admin</div>
            <div className="text-sm text-bone-200/55 truncate">{user.email}</div>
          </div>
          <nav className="space-y-0.5">
            {NAV.map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 px-3 py-2.5 text-sm text-bone-200/75 hover:bg-ink-700 hover:text-ember transition-colors"
              >
                <Icon size={14} />
                {label}
              </Link>
            ))}
            <div className="pt-3 mt-3 border-t border-bone-200/10 space-y-0.5">
              <Link
                href="/account"
                className="flex items-center gap-3 px-3 py-2.5 text-sm text-bone-200/60 hover:text-ember transition-colors"
              >
                <ArrowUpRight size={14} />
                My account
              </Link>
              <form action="/auth/sign-out" method="POST">
                <button
                  type="submit"
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-bone-200/60 hover:text-ember transition-colors"
                >
                  <LogOut size={14} />
                  Sign out
                </button>
              </form>
            </div>
          </nav>
        </aside>

        <div>{children}</div>
      </div>
    </div>
  );
}
