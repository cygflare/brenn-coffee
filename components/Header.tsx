'use client';

import Link from 'next/link';
import { Search, User, ShoppingBag, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useCart } from '@/lib/cart-store';

const NAV_LINKS = [
  { label: 'Shop', href: '/shop' },
  { label: 'Origins', href: '/shop?view=origins' },
  { label: 'Brewing', href: '/brewing' },
  { label: 'Journal', href: '/journal' },
  { label: 'About', href: '/about' },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { toggleCart, getItemCount } = useCart();
  const [itemCount, setItemCount] = useState(0);

  useEffect(() => {
    // Hydrate the cart count after mount (avoid SSR mismatch)
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
            <svg
              viewBox="0 0 80 100"
              className="w-5 h-[26px] text-ember transition-[filter] duration-300 drop-shadow-[0_0_8px_rgba(232,85,28,0.45)] group-hover:drop-shadow-[0_0_14px_rgba(232,85,28,0.7)]"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M44 4 C48 16, 60 26, 66 40 C72 56, 70 76, 56 88 C46 96, 30 96, 20 86 C10 74, 10 56, 18 42 C24 30, 32 22, 38 12 C40 8, 42 6, 44 4 Z" />
            </svg>
            <span className="font-serif text-2xl tracking-[0.08em] text-bone-100">BRENN</span>
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
            <Link
              href="/account"
              aria-label="Account"
              className="hidden sm:flex w-9 h-9 rounded-full border border-bone-200/15 items-center justify-center text-bone-200 hover:border-ember hover:text-ember transition-colors"
            >
              <User size={14} />
            </Link>
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

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-ink-900 pt-20 px-5 md:hidden">
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
          </nav>
        </div>
      )}
    </>
  );
}
