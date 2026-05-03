'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/cart-store';
import { GRIND_LABELS, SIZE_LABELS, type AppliedCoupon } from '@/lib/types';
import { formatPrice, calculateShipping, SUBSCRIPTION_DISCOUNT } from '@/lib/utils';
import { ArrowRight, Loader2, Tag, X, Check, Plus, Minus, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function CheckoutPage() {
  const {
    items,
    getSubtotal,
    appliedCoupon,
    setCoupon,
    clearCoupon,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Coupon UI state
  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) setEmail(user.email);
    });
  }, []);

  if (!mounted) return null;

  const subtotal = getSubtotal();
  const shippingBase = calculateShipping(subtotal);
  const discountPence = appliedCoupon?.discount_pence ?? 0;
  const shippingPence = appliedCoupon?.free_shipping ? 0 : shippingBase;
  const total = Math.max(0, subtotal + shippingPence - (appliedCoupon?.free_shipping ? 0 : discountPence));

  if (items.length === 0) {
    return (
      <div className="container-x section-y-lg text-center">
        <h1 className="font-serif text-5xl text-bone-100 mb-4">Your cart is empty</h1>
        <p className="text-bone-200/60 mb-8">Add a coffee to continue.</p>
        <Link href="/shop" className="btn-primary">
          Browse coffee →
        </Link>
      </div>
    );
  }

  async function applyCoupon(e: React.FormEvent) {
    e.preventDefault();
    setCouponError(null);
    const code = couponInput.trim();
    if (!code) return;
    setCouponLoading(true);
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, items, email }),
      });
      const data = (await res.json()) as
        | { ok: true; applied: AppliedCoupon }
        | { ok: false; error: string };
      if (!data.ok) {
        setCouponError(data.error);
        clearCoupon();
        return;
      }
      setCoupon(data.applied);
      setCouponInput('');
    } catch (err: any) {
      setCouponError(err.message || 'Could not apply coupon.');
    } finally {
      setCouponLoading(false);
    }
  }

  function removeCoupon() {
    clearCoupon();
    setCouponError(null);
  }

  async function handleCheckout() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          email,
          couponCode: appliedCoupon?.code ?? null,
        }),
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
    <div className="container-x section-y">
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
        <div className="bg-ink-700 border border-bone-200/20 shadow-lg p-6 lg:p-8 h-fit lg:sticky lg:top-24">
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="font-serif text-3xl text-bone-100">Order summary</h2>
            <button
              onClick={clearCart}
              className="text-xs tracking-[0.15em] uppercase text-bone-200/60 hover:text-ember transition-colors inline-flex items-center gap-1.5"
              aria-label="Empty cart"
            >
              <Trash2 size={12} />
              Empty
            </button>
          </div>

          {/* Line items */}
          <ul className="divide-y divide-bone-200/15">
            {items.map((item) => {
              const unit = item.isSubscription
                ? item.unitPricePence * (1 - SUBSCRIPTION_DISCOUNT)
                : item.unitPricePence;
              const lineTotal = unit * item.quantity;
              return (
                <li
                  key={`${item.variantId}-${item.isSubscription}`}
                  className="py-5 first:pt-0"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0">
                      <div className="font-serif text-xl text-bone-100 leading-tight mb-1">
                        {item.productName}
                        {item.isSubscription && (
                          <span className="ml-2 text-[10px] tracking-[0.15em] uppercase text-ember align-middle">
                            · Sub
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-bone-200/80">
                        {SIZE_LABELS[item.size_g]} · {GRIND_LABELS[item.grind]}
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(item.variantId, item.isSubscription)}
                      aria-label={`Remove ${item.productName}`}
                      className="w-8 h-8 flex items-center justify-center text-bone-200/50 hover:text-ember hover:border-ember border border-bone-200/15 transition-colors flex-shrink-0"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div className="inline-flex items-center border border-bone-200/25 bg-ink-900/40">
                      <button
                        onClick={() =>
                          updateQuantity(item.variantId, item.isSubscription, item.quantity - 1)
                        }
                        aria-label="Decrease quantity"
                        className="w-11 h-11 flex items-center justify-center text-bone-200/85 hover:text-ember hover:bg-ink-700/50 transition-colors"
                      >
                        <Minus size={18} />
                      </button>
                      <span className="w-12 text-center text-xl font-medium text-bone-100 tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.variantId, item.isSubscription, item.quantity + 1)
                        }
                        aria-label="Increase quantity"
                        className="w-11 h-11 flex items-center justify-center text-bone-200/85 hover:text-ember hover:bg-ink-700/50 transition-colors"
                      >
                        <Plus size={18} />
                      </button>
                    </div>

                    <div className="text-right">
                      <div className="font-serif text-2xl text-bone-100 font-medium tabular-nums leading-none">
                        {formatPrice(lineTotal)}
                      </div>
                      {item.quantity > 1 && (
                        <div className="text-sm text-bone-200/70 tabular-nums mt-1.5">
                          {formatPrice(unit)} each
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Coupon section */}
          <div className="py-5 mt-1 border-t border-bone-200/15">
            {appliedCoupon ? (
              <div className="flex items-start justify-between gap-3 bg-ember/10 border border-ember/30 px-3 py-2.5">
                <div className="flex items-start gap-2 min-w-0">
                  <Check size={14} className="text-ember mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="text-sm text-bone-100 font-serif font-medium">
                      {appliedCoupon.code}
                    </div>
                    <div className="text-[11px] text-bone-200/70 truncate">
                      {appliedCoupon.free_shipping
                        ? 'Free shipping applied'
                        : `${formatPrice(appliedCoupon.discount_pence)} off`}
                      {appliedCoupon.description ? ` · ${appliedCoupon.description}` : ''}
                    </div>
                  </div>
                </div>
                <button
                  onClick={removeCoupon}
                  aria-label="Remove coupon"
                  className="text-bone-200/65 hover:text-ember flex-shrink-0"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <form onSubmit={applyCoupon}>
                <label className="text-[11px] tracking-[0.2em] uppercase text-bone-200/75 flex items-center gap-2 mb-2">
                  <Tag size={11} /> Have a coupon?
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="ENTER CODE"
                    className="flex-1 bg-ink-900 border border-bone-200/20 px-3 py-2 text-sm text-bone-100 outline-none focus:border-ember tracking-wider uppercase"
                  />
                  <button
                    type="submit"
                    disabled={couponLoading || !couponInput.trim()}
                    className="px-4 py-2 text-xs tracking-[0.15em] uppercase border border-bone-200/25 text-bone-100 hover:border-ember hover:text-ember transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {couponLoading ? <Loader2 size={12} className="animate-spin" /> : 'Apply'}
                  </button>
                </div>
                {couponError && (
                  <p className="mt-2 text-xs text-red-400">{couponError}</p>
                )}
              </form>
            )}
          </div>

          {/* Totals */}
          <dl className="space-y-3 py-5 text-base border-t border-bone-200/15">
            <div className="flex items-baseline justify-between">
              <dt className="text-bone-200/85">Subtotal</dt>
              <dd className="text-bone-100 font-medium tabular-nums">{formatPrice(subtotal)}</dd>
            </div>
            {appliedCoupon && !appliedCoupon.free_shipping && discountPence > 0 && (
              <div className="flex items-baseline justify-between">
                <dt className="text-ember">Discount ({appliedCoupon.code})</dt>
                <dd className="text-ember font-medium tabular-nums">−{formatPrice(discountPence)}</dd>
              </div>
            )}
            <div className="flex items-baseline justify-between">
              <dt className="text-bone-200/85">Shipping</dt>
              <dd className="text-bone-100 font-medium tabular-nums">
                {appliedCoupon?.free_shipping ? (
                  <>
                    <span className="line-through text-bone-200/45 mr-2 font-normal">
                      {shippingBase === 0 ? 'Free' : formatPrice(shippingBase)}
                    </span>
                    <span className="text-ember">Free</span>
                  </>
                ) : shippingPence === 0 ? (
                  'Free'
                ) : (
                  formatPrice(shippingPence)
                )}
              </dd>
            </div>
          </dl>

          <div className="flex items-baseline justify-between pt-5 border-t border-bone-200/20">
            <span className="font-serif text-xl text-bone-100">Total</span>
            <span className="font-serif text-4xl text-ember tabular-nums leading-none">
              {formatPrice(total)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
