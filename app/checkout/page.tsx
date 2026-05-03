'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/cart-store';
import { GRIND_LABELS, SIZE_LABELS } from '@/lib/types';
import { formatPrice, calculateShipping, SUBSCRIPTION_DISCOUNT } from '@/lib/utils';
import { ArrowRight, Loader2 } from 'lucide-react';

export default function CheckoutPage() {
  const { items, getSubtotal } = useCart();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const subtotal = getSubtotal();
  const shipping = calculateShipping(subtotal);
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <div className="container-x py-32 text-center">
        <h1 className="font-serif text-5xl text-bone-100 mb-4">Your cart is empty</h1>
        <p className="text-bone-200/60 mb-8">Add a coffee to continue.</p>
        <Link href="/shop" className="btn-primary">
          Browse coffee →
        </Link>
      </div>
    );
  }

  async function handleCheckout() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, email }),
      });

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || 'Checkout failed');
      }

      const { url } = await res.json();
      window.location.href = url;
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div className="container-x py-12 lg:py-20">
      <h1 className="font-serif text-4xl lg:text-6xl text-bone-100 mb-3">
        <em className="italic text-ember">Checkout</em>
      </h1>
      <p className="text-bone-200/55 mb-12">
        Quick and secure. Powered by Stripe.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-12 lg:gap-16">
        {/* Email + button */}
        <div>
          <h2 className="font-serif text-2xl text-bone-100 mb-6">Contact</h2>
          <label className="block mb-2 text-[11px] tracking-[0.2em] uppercase text-bone-200/65">
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full bg-transparent border border-bone-200/15 px-4 py-3 text-bone-100 outline-none focus:border-ember"
          />
          <p className="text-xs text-bone-200/45 mt-2">
            We'll send your order confirmation here.
          </p>

          <button
            onClick={handleCheckout}
            disabled={loading || !email}
            className="btn-primary w-full mt-8 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                Redirecting to Stripe...
              </>
            ) : (
              <>
                Continue to payment <ArrowRight size={16} />
              </>
            )}
          </button>

          {error && (
            <p className="mt-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 px-4 py-3">
              {error}
            </p>
          )}

          <p className="text-xs text-bone-200/45 mt-6 leading-relaxed">
            You'll enter your shipping and payment details on the next page (Stripe). We never
            see or store your card information.
          </p>
        </div>

        {/* Order summary */}
        <div className="bg-ink-700 border border-bone-200/8 p-6 lg:p-8 h-fit lg:sticky lg:top-24">
          <h2 className="font-serif text-2xl text-bone-100 mb-6">Order summary</h2>

          <div className="space-y-5 pb-6 border-b border-bone-200/10">
            {items.map((item) => {
              const lineTotal =
                (item.isSubscription
                  ? item.unitPricePence * (1 - SUBSCRIPTION_DISCOUNT)
                  : item.unitPricePence) * item.quantity;
              return (
                <div
                  key={`${item.variantId}-${item.isSubscription}`}
                  className="flex justify-between gap-4 text-sm"
                >
                  <div>
                    <div className="text-bone-100 font-serif text-base mb-0.5">
                      {item.productName}
                      {item.isSubscription && (
                        <span className="ml-2 text-[10px] tracking-[0.15em] uppercase text-ember">
                          · Subscription
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-bone-200/50">
                      {SIZE_LABELS[item.size_g]} · {GRIND_LABELS[item.grind]} ·{' '}
                      <span className="font-serif italic">×{item.quantity}</span>
                    </div>
                  </div>
                  <div className="text-bone-100 font-serif text-base flex-shrink-0">
                    {formatPrice(lineTotal)}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="space-y-2.5 py-5 text-sm">
            <div className="flex justify-between text-bone-200/70">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-bone-200/70">
              <span>Shipping</span>
              <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
            </div>
          </div>

          <div className="flex justify-between font-serif text-2xl pt-5 border-t border-bone-200/10">
            <span className="text-bone-100">Total</span>
            <span className="text-ember">{formatPrice(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
