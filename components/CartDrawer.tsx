'use client';

import { useCart } from '@/lib/cart-store';
import { GRIND_LABELS, SIZE_LABELS } from '@/lib/types';
import { formatPrice, calculateShipping, SUBSCRIPTION_DISCOUNT } from '@/lib/utils';
import { X, Plus, Minus, Repeat } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, getSubtotal } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!mounted) return null;

  const subtotal = getSubtotal();
  const shipping = calculateShipping(subtotal);
  const total = subtotal + shipping;
  const freeShipDelta = 3000 - subtotal;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className={`fixed inset-0 z-40 bg-ink-900/70 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 z-50 h-full w-full sm:w-[440px] bg-ink-800 border-l border-bone-200/10 transition-transform duration-300 ease-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-bone-200/10">
          <h2 className="font-serif text-2xl text-bone-100">Your cart</h2>
          <button
            onClick={closeCart}
            aria-label="Close"
            className="w-9 h-9 rounded-full border border-bone-200/15 flex items-center justify-center hover:border-ember hover:text-ember transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 rounded-full border border-bone-200/15 flex items-center justify-center mb-4">
              <span className="text-bone-200/40 text-2xl">∅</span>
            </div>
            <p className="font-serif text-xl text-bone-100 mb-2">Your cart is empty</p>
            <p className="text-sm text-bone-200/55 mb-6">Time to find your roast.</p>
            <Link href="/shop" onClick={closeCart} className="btn-primary">
              Browse coffee →
            </Link>
          </div>
        ) : (
          <>
            {/* Free shipping progress */}
            {freeShipDelta > 0 && (
              <div className="px-6 py-4 bg-ember/5 border-b border-ember/20">
                <div className="text-xs text-bone-200/75 mb-2">
                  Add{' '}
                  <span className="text-ember font-medium">{formatPrice(freeShipDelta)}</span>{' '}
                  more for free UK shipping
                </div>
                <div className="h-1 bg-bone-200/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-ember transition-all duration-500"
                    style={{ width: `${Math.min(100, (subtotal / 3000) * 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {items.map((item) => (
                <div
                  key={`${item.variantId}-${item.isSubscription}`}
                  className="flex gap-4 pb-5 border-b border-bone-200/10 last:border-0"
                >
                  <div className="w-20 h-24 bg-ink-700 border border-bone-200/10 flex-shrink-0 flex items-center justify-center">
                    <div className="w-12 h-16 bg-ink-600 relative">
                      <div className="absolute inset-0 flex items-center justify-center font-serif italic text-ember text-[10px]">
                        {item.productName.slice(0, 1)}
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between gap-2 mb-1">
                      <Link
                        href={`/product/${item.productSlug}`}
                        onClick={closeCart}
                        className="font-serif text-lg text-bone-100 hover:text-ember leading-tight"
                      >
                        {item.productName}
                      </Link>
                      <button
                        onClick={() => removeItem(item.variantId, item.isSubscription)}
                        aria-label="Remove"
                        className="text-bone-200/40 hover:text-ember"
                      >
                        <X size={14} />
                      </button>
                    </div>

                    <div className="text-xs text-bone-200/55 mb-2">
                      {SIZE_LABELS[item.size_g]} · {GRIND_LABELS[item.grind]}
                    </div>

                    {item.isSubscription && (
                      <div className="inline-flex items-center gap-1 text-[10px] tracking-[0.15em] uppercase text-ember mb-2">
                        <Repeat size={10} />
                        Subscription · 15% off
                      </div>
                    )}

                    <div className="flex justify-between items-center mt-2">
                      <div className="flex items-center border border-bone-200/15">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.variantId,
                              item.isSubscription,
                              item.quantity - 1
                            )
                          }
                          className="w-8 h-8 flex items-center justify-center text-bone-200/70 hover:text-ember"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-8 text-center text-sm font-serif italic">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.variantId,
                              item.isSubscription,
                              item.quantity + 1
                            )
                          }
                          className="w-8 h-8 flex items-center justify-center text-bone-200/70 hover:text-ember"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <div className="font-serif text-ember">
                        {formatPrice(
                          (item.isSubscription
                            ? item.unitPricePence * (1 - SUBSCRIPTION_DISCOUNT)
                            : item.unitPricePence) * item.quantity
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals + checkout */}
            <div className="p-6 border-t border-bone-200/10 space-y-3">
              <div className="flex justify-between text-sm text-bone-200/70">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-bone-200/70">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between font-serif text-xl pt-3 border-t border-bone-200/10">
                <span className="text-bone-100">Total</span>
                <span className="text-ember">{formatPrice(total)}</span>
              </div>
              <Link
                href="/checkout"
                onClick={closeCart}
                className="btn-primary w-full text-center mt-4 block"
              >
                Checkout · {formatPrice(total)}
              </Link>
              <p className="text-[11px] text-bone-200/40 text-center mt-2">
                Taxes calculated at checkout
              </p>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
