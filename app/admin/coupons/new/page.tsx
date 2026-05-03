import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { CouponForm } from '../CouponForm';
import { createCouponAction } from '../actions';

export const metadata = { title: 'New coupon', robots: { index: false, follow: false } };

export default function NewCouponPage() {
  return (
    <div>
      <Link
        href="/admin/coupons"
        className="inline-flex items-center gap-2 text-xs tracking-[0.15em] uppercase text-bone-200/60 hover:text-ember mb-6"
      >
        <ArrowLeft size={12} />
        All coupons
      </Link>

      <header className="mb-6">
        <div className="eyebrow mb-2">Marketing</div>
        <h1 className="font-serif text-4xl text-bone-100 leading-[1] mb-3">New coupon</h1>
        <p className="text-sm text-bone-200/55">
          Customers enter the code at checkout. The discount is validated server-side and applied via Stripe.
        </p>
      </header>

      <CouponForm action={createCouponAction} submitLabel="Create coupon" />
    </div>
  );
}
