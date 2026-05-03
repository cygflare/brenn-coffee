import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { adminDb } from '@/lib/auth';
import { CouponForm } from '../CouponForm';
import { updateCouponAction } from '../actions';
import { DeleteForm } from './DeleteForm';
import { formatPrice } from '@/lib/utils';
import { describeCoupon } from '@/lib/coupons';
import type { Coupon } from '@/lib/types';

export const metadata = { title: 'Edit coupon', robots: { index: false, follow: false } };

export default async function EditCouponPage({ params }: { params: { id: string } }) {
  const db = adminDb();
  const { data: coupon } = await db.from('coupons').select('*').eq('id', params.id).single();
  if (!coupon) notFound();

  const { data: redemptions } = await db
    .from('coupon_redemptions')
    .select('id, discount_pence, email, created_at, order_id, orders(order_number, total_pence)')
    .eq('coupon_id', params.id)
    .order('created_at', { ascending: false })
    .limit(50);

  const totalDiscount = (redemptions ?? []).reduce(
    (s, r) => s + (r.discount_pence ?? 0),
    0
  );
  const uniqueCustomers = new Set((redemptions ?? []).map((r) => r.email.toLowerCase())).size;

  const updateAction = updateCouponAction.bind(null, params.id);

  return (
    <div>
      <Link
        href="/admin/coupons"
        className="inline-flex items-center gap-2 text-xs tracking-[0.15em] uppercase text-bone-200/60 hover:text-ember mb-6"
      >
        <ArrowLeft size={12} />
        All coupons
      </Link>

      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="eyebrow mb-2">Edit coupon</div>
          <h1 className="font-mono text-4xl text-bone-100 leading-[1]">
            {coupon.code}
          </h1>
          <p className="text-xs text-bone-200/55 mt-2">{describeCoupon(coupon as Coupon)}</p>
        </div>
        <DeleteForm id={params.id} code={coupon.code} />
      </header>

      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <Stat label="Times used" value={coupon.times_used.toString()} />
        <Stat
          label="Total off"
          value={totalDiscount > 0 ? formatPrice(totalDiscount) : '—'}
        />
        <Stat label="Unique customers" value={uniqueCustomers.toString()} />
        <Stat
          label="Usage limit"
          value={coupon.usage_limit != null ? coupon.usage_limit.toString() : 'Unlimited'}
        />
      </section>

      <CouponForm action={updateAction} coupon={coupon as Coupon} submitLabel="Save changes" />

      {redemptions && redemptions.length > 0 && (
        <section className="mt-10 pt-6 border-t border-bone-200/10">
          <h2 className="font-serif text-2xl text-bone-100 mb-1">Recent redemptions</h2>
          <p className="text-xs text-bone-200/55 mb-4">
            Showing the latest {redemptions.length} redemptions.
          </p>
          <div className="border border-bone-200/8">
            <table className="w-full text-sm">
              <thead className="bg-ink-700">
                <tr className="text-left text-xs tracking-[0.15em] uppercase text-bone-200/55">
                  <th className="px-4 py-2.5 font-normal">Order</th>
                  <th className="px-4 py-2.5 font-normal">Email</th>
                  <th className="px-4 py-2.5 font-normal text-right">Discount</th>
                  <th className="px-4 py-2.5 font-normal text-right">Order total</th>
                  <th className="px-4 py-2.5 font-normal">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bone-200/8">
                {redemptions.map((r: any) => {
                  const order = Array.isArray(r.orders) ? r.orders[0] : r.orders;
                  return (
                    <tr key={r.id} className="bg-ink-700/40">
                      <td className="px-4 py-2.5">
                        {order?.order_number ? (
                          <Link
                            href={`/admin/orders/${order.order_number}`}
                            className="text-bone-100 hover:text-ember font-mono text-xs"
                          >
                            {order.order_number}
                          </Link>
                        ) : (
                          <span className="text-bone-200/40">—</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-bone-200/70 text-xs">{r.email}</td>
                      <td className="px-4 py-2.5 text-right text-ember tabular-nums">
                        −{formatPrice(r.discount_pence)}
                      </td>
                      <td className="px-4 py-2.5 text-right text-bone-100 tabular-nums">
                        {order?.total_pence != null ? formatPrice(order.total_pence) : '—'}
                      </td>
                      <td className="px-4 py-2.5 text-bone-200/65 text-xs">
                        {new Date(r.created_at).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-ink-700 border border-bone-200/8 px-4 py-3">
      <div className="text-[10px] tracking-[0.2em] uppercase text-bone-200/55 mb-1">{label}</div>
      <div className="font-serif text-2xl text-bone-100 tabular-nums">{value}</div>
    </div>
  );
}
