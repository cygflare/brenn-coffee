import Link from 'next/link';
import type { Metadata } from 'next';
import { requireAuth } from '@/lib/auth';
import { LayoutDashboard, Package, MapPin, User as UserIcon, LogOut } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Account',
  robots: { index: false, follow: false },
};

const NAV = [
  { label: 'Overview', href: '/account', icon: LayoutDashboard },
  { label: 'Orders', href: '/account/orders', icon: Package },
];

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAuth('/account');

  return (
    <div className="container-x section-y">
      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-12">
        <aside>
          <div className="mb-8">
            <div className="text-xs text-bone-200/50 tracking-[0.15em] uppercase mb-1">
              Signed in as
            </div>
            <div className="text-sm text-bone-100 truncate">{user.email}</div>
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
            {user.role === 'admin' && (
              <Link
                href="/admin"
                className="flex items-center gap-3 px-3 py-2.5 text-sm text-ember hover:bg-ink-700 transition-colors mt-4 border-t border-bone-200/10 pt-4"
              >
                <LayoutDashboard size={14} />
                Admin dashboard
              </Link>
            )}
            <form action="/auth/sign-out" method="POST" className="pt-4 mt-4 border-t border-bone-200/10">
              <button
                type="submit"
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-bone-200/60 hover:text-ember transition-colors"
              >
                <LogOut size={14} />
                Sign out
              </button>
            </form>
          </nav>
        </aside>

        <div>{children}</div>
      </div>
    </div>
  );
}
