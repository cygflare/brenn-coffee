'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCart } from '@/lib/cart-store';
import { Check } from 'lucide-react';

function SuccessContent() {
  const params = useSearchParams();
  const sessionId = params.get('session_id');
  const clearCart = useCart((s) => s.clearCart);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  useEffect(() => {
    clearCart();
    if (sessionId) {
      fetch(`/api/orders/by-session?id=${sessionId}`)
        .then((r) => r.json())
        .then((d) => d.order_number && setOrderNumber(d.order_number))
        .catch(() => {});
    }
  }, [clearCart, sessionId]);

  return (
    <div className="container-x py-32 text-center max-w-2xl mx-auto">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-ember/10 border border-ember/30 mb-8">
        <Check size={32} className="text-ember" />
      </div>

      <div className="eyebrow justify-center mb-6">Order confirmed</div>

      <h1 className="font-serif text-5xl lg:text-7xl text-bone-100 leading-none mb-6">
        Thank <em className="italic text-ember">you.</em>
      </h1>

      <p className="text-bone-200/70 text-lg leading-relaxed mb-3">
        Your coffee will be roasted to order and shipped within 48 hours.
      </p>

      {orderNumber && (
        <p className="font-serif italic text-ember text-xl mb-10">
          Order #{orderNumber}
        </p>
      )}

      <p className="text-sm text-bone-200/50 mb-10 max-w-md mx-auto">
        We&apos;ve sent a confirmation email with tracking details (once your order ships) and
        receipts for your records.
      </p>

      <div className="flex flex-wrap gap-4 justify-center">
        <Link href="/shop" className="btn-primary">
          Browse more coffee →
        </Link>
        <Link href="/" className="btn-ghost">
          Back to home
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="container-x py-32 text-center text-bone-200/50">
          Loading...
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
