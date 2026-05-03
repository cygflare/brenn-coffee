import Link from 'next/link';
import { adminDb } from '@/lib/auth';
import { formatPrice } from '@/lib/utils';
import { describeCoupon } from '@/lib/coupons';
import { Plus, Ticket } from 'lucide-react';
import type { Coupon } from '@/lib/types';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Coupons', robots: { index: false, follow: false } };

type CouponWithStats = Coupon & {
  total_discount_pence: number;
  total_redemptions: number;
};

export default async function AdminCouponsPage() {
  const db = adminDb();
  const { data: coupons } = await db
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false });

  const ids = (coupons ?? []).map((c) => c.id);
  let statsMap = new Map<string, { total: number; count: number }>();
  if (ids.length > 0) {
    const { data: redemptions } = await db
      .from('coupon_redemptions')
      .select('coupon_id, discount_pence')
      .in('coupon_id', ids);
    for (const r of redemptions ?? []) {
      const cur = statsMap.get(r.coupon_id) ?? { total: 0, count: 0 };
      cur.total += r.discount_pence ?? 0;
      cur.count += 1;
      statsMap.set(r.coupon_id, cur);
    }
  }

  const enriched: CouponWithStats[] = (coupons ?? []).map((c) => {
    const s = statsMap.get(c.id);
    return {
      ...(c as Coupon),
      total_discount_pence: s?.total ?? 0,
      total_redemptions: s?.count ?? 0,
    };
  });

  const now = new Date();

  return (
    <div>
      <header className="mb-6 flex items-center justify-between">
        <div>
          <div className="eyebrow mb-2">Marketing</div>
          <h1 className="font-serif text-4xl text-bone-100 leading-[1]">Coupons</h1>
        </div>
        <Link
          href="/admin/coupons/new"
          className="btn-primary inline-flex items-center gap-2"
        >
          <Plus size={16} />
          New coupon
        </Link>
      </header>

      {enriched.length > 0 ? (
        <div className="border border-bone-200/8">
          <table className="w-full text-sm">
            <thead className="bg-ink-700">
              <tr className="text-left text-xs tracking-[0.15em] uppercase text-bone-200/55">
                <th className="px-4 py-3 font-normal">Code</th>
                <th className="px-4 py-3 font-normal">Discount</th>
                <th className="px-4 py-3 font-normal">Status</th>
                <th className="px-4 py-3 font-normal text-right">Used</th>
                <th className="px-4 py-3 font-normal text-right">Total off</th>
                <th className="px-4 py-3 font-normal">Expires</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bone-200/8">
              {enriched.map((c) => {
                const expired = c.expires_at && new Date(c.expires_at) < now;
                const limited = c.usage_limit != null && c.times_used >= c.usage_limit;
                const status = !c.is_active
                  ? { label: 'Disabled', cls: 'bg-bone-200/10 text-bone-200/55' }
                  : expired
                    ? { label: 'Expired', cls: 'bg-bone-200/10 text-bone-200/55' }
                    : limited
                      ? { label: 'Used up', cls: 'bg-bone-200/10 text-bone-200/55' }
                      : { label: 'Active', cls: 'bg-green-500/15 text-green-300' };
                return (
                  <tr key={c.id} className="bg-ink-700/40 hover:bg-ink-700 transition-colors">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/coupons/${c.id}`}
                        className="text-bone-100 hover:text-ember font-mono"
                      >
                        {c.code}
                      </Link>
                      {c.description && (
                        <div className="text-xs text-bone-200/45 mt-0.5">{c.description}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-bone-200/75">{describeCoupon(c)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-[10px] tracking-[0.15em] uppercase px-2 py-1 ${status.cls}`}
                      >
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-bone-100 tabular-nums">
                      {c.times_used}
                      {c.usage_limit != null && (
                        <span className="text-bone-200/40"> / {c.usage_limit}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-bone-100 tabular-nums">
                      {c.total_discount_pence > 0 ? formatPrice(c.total_discount_pence) : '—'}
                    </td>
                    <td className="px-4 py-3 text-bone-200/65 text-xs">
                      {c.expires_at
                        ? new Date(c.expires_at).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })
                        : 'Never'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-ink-700 border border-bone-200/8 p-12 text-center">
          <Ticket size={32} className="text-bone-200/30 mx-auto mb-4" />
          <p className="text-bone-200/65 mb-6">No coupons yet.</p>
          <Link href="/admin/coupons/new" className="btn-primary">
            Create your first coupon
          </Link>
        </div>
      )}
    </div>
  );
}
