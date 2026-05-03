'use client';

import Link from 'next/link';
import { Search, User as UserIcon, ShoppingBag, Menu, X, LogOut, LayoutDashboard } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useCart } from '@/lib/cart-store';
import type { AuthUser } from '@/lib/auth';

const NAV_LINKS = [
  { label: 'Shop', href: '/shop' },
  { label: 'Origins', href: '/shop?view=origins' },
  { label: 'Brewing', href: '/brewing' },
  { label: 'Journal', href: '/journal' },
  { label: 'About', href: '/about' },
];

export function Header({ user }: { user: AuthUser | null }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const { toggleCart, getItemCount } = useCart();
  const [itemCount, setItemCount] = useState(0);
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setItemCount(getItemCount());
    const unsub = useCart.subscribe((state) => {
      setItemCount(state.items.reduce((s, i) => s + i.quantity, 0));
    });
    return unsub;
  }, [getItemCount]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!accountOpen) return;
    function onClick(e: MouseEvent) {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountOpen(false);
      }
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [accountOpen]);

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-ink-900/90 backdrop-blur-md border-b border-bone-200/10'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="container-x flex items-center justify-between py-4">
          <Link href="/" className="flex items-center gap-3 group" aria-label="Brenn Coffee — home">
            <span
              aria-hidden="true"
              className="block w-[18px] h-[18px] rounded-full bg-ember transition-[filter] duration-300 drop-shadow-[0_0_10px_rgba(232,85,28,0.55)] group-hover:drop-shadow-[0_0_16px_rgba(232,85,28,0.8)]"
            />
            <span className="font-serif text-2xl tracking-[0.18em] text-bone-100">BRENN</span>
          </Link>

          <nav className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs tracking-[0.15em] uppercase text-bone-200/65 hover:text-ember transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              aria-label="Search"
              className="hidden sm:flex w-9 h-9 rounded-full border border-bone-200/15 items-center justify-center text-bone-200 hover:border-ember hover:text-ember transition-colors"
            >
              <Search size={14} />
            </button>

            {user ? (
              <div className="relative hidden sm:block" ref={accountRef}>
                <button
                  onClick={() => setAccountOpen((o) => !o)}
                  aria-label="Account menu"
                  className="w-9 h-9 rounded-full border border-bone-200/15 flex items-center justify-center text-bone-200 hover:border-ember hover:text-ember transition-colors"
                >
                  <UserIcon size={14} />
                </button>

                {accountOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-ink-700 border border-bone-200/15 shadow-xl py-1.5 z-50">
                    <div className="px-4 py-3 border-b border-bone-200/10">
                      <div className="text-xs text-bone-200/50 mb-0.5">Signed in as</div>
                      <div className="text-sm text-bone-100 truncate">{user.email}</div>
                    </div>
                    <Link
                      href="/account"
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-bone-200 hover:bg-ink-600 hover:text-ember"
                      onClick={() => setAccountOpen(false)}
                    >
                      <UserIcon size={14} />
                      My account
                    </Link>
                    {user.role === 'admin' && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ember hover:bg-ink-600"
                        onClick={() => setAccountOpen(false)}
                      >
                        <LayoutDashboard size={14} />
                        Admin dashboard
                      </Link>
                    )}
                    <form action="/auth/sign-out" method="POST">
                      <button
                        type="submit"
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-bone-200/80 hover:bg-ink-600 hover:text-ember text-left"
                      >
                        <LogOut size={14} />
                        Sign out
                      </button>
                    </form>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/sign-in"
                aria-label="Sign in"
                className="hidden sm:flex w-9 h-9 rounded-full border border-bone-200/15 items-center justify-center text-bone-200 hover:border-ember hover:text-ember transition-colors"
              >
                <UserIcon size={14} />
              </Link>
            )}

            <button
              onClick={toggleCart}
              aria-label="Cart"
              className="relative w-9 h-9 rounded-full border border-bone-200/15 flex items-center justify-center text-bone-200 hover:border-ember hover:text-ember transition-colors"
            >
              <ShoppingBag size={14} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-ember text-ink-900 text-[10px] font-medium rounded-full w-4 h-4 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
              className="md:hidden w-9 h-9 flex items-center justify-center text-bone-200"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-ink-900 pt-20 px-5 md:hidden overflow-y-auto">
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="font-serif text-3xl py-4 border-b border-bone-200/10 text-bone-100 hover:text-ember"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-6 mt-2 border-t border-bone-200/10">
              {user ? (
                <>
                  <Link
                    href="/account"
                    onClick={() => setMobileOpen(false)}
                    className="block py-3 text-sm tracking-[0.15em] uppercase text-bone-200/65 hover:text-ember"
                  >
                    My account
                  </Link>
                  {user.role === 'admin' && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileOpen(false)}
                      className="block py-3 text-sm tracking-[0.15em] uppercase text-ember"
                    >
                      Admin dashboard
                    </Link>
                  )}
                  <form action="/auth/sign-out" method="POST">
                    <button
                      type="submit"
                      className="block py-3 text-sm tracking-[0.15em] uppercase text-bone-200/65 hover:text-ember w-full text-left"
                    >
                      Sign out
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <Link
                    href="/sign-in"
                    onClick={() => setMobileOpen(false)}
                    className="block py-3 text-sm tracking-[0.15em] uppercase text-bone-200/65 hover:text-ember"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/sign-up"
                    onClick={() => setMobileOpen(false)}
                    className="block py-3 text-sm tracking-[0.15em] uppercase text-ember"
                  >
                    Create account
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
