import Link from 'next/link';
import { adminDb } from '@/lib/auth';
import { formatPrice } from '@/lib/utils';
import { ShoppingBag } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const db = adminDb();
  const filter = searchParams.status;

  let q = db
    .from('orders')
    .select('order_number, email, status, total_pence, created_at, shipping_city')
    .order('created_at', { ascending: false })
    .limit(100);

  if (filter && filter !== 'all') {
    q = q.eq('status', filter);
  }

  const { data: orders } = await q;

  const filters: { label: string; value: string }[] = [
    { label: 'All', value: 'all' },
    { label: 'Paid', value: 'paid' },
    { label: 'Shipped', value: 'shipped' },
    { label: 'Delivered', value: 'delivered' },
    { label: 'Refunded', value: 'refunded' },
  ];

  return (
    <div>
      <header className="mb-8">
        <div className="eyebrow mb-3">Fulfilment</div>
        <h1 className="font-serif text-4xl text-bone-100 leading-[1]">Orders</h1>
      </header>

      <div className="flex gap-1 mb-6 border-b border-bone-200/10">
        {filters.map((f) => {
          const active = (filter ?? 'all') === f.value;
          return (
            <Link
              key={f.value}
              href={f.value === 'all' ? '/admin/orders' : `/admin/orders?status=${f.value}`}
              className={`px-4 py-2.5 text-xs tracking-[0.15em] uppercase transition-colors border-b-2 -mb-px ${
                active ? 'text-ember border-ember' : 'text-bone-200/55 border-transparent hover:text-bone-200'
              }`}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      {orders && orders.length > 0 ? (
        <div className="border border-bone-200/8">
          <table className="w-full text-sm">
            <thead className="bg-ink-700">
              <tr className="text-left text-xs tracking-[0.15em] uppercase text-bone-200/55">
                <th className="px-4 py-3 font-normal">Order</th>
                <th className="px-4 py-3 font-normal">Email</th>
                <th className="px-4 py-3 font-normal">City</th>
                <th className="px-4 py-3 font-normal">Date</th>
                <th className="px-4 py-3 font-normal text-right">Total</th>
                <th className="px-4 py-3 font-normal text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bone-200/8">
              {orders.map((o) => (
                <tr key={o.order_number} className="bg-ink-700/40 hover:bg-ink-700 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${o.order_number}`} className="text-bone-100 hover:text-ember">
                      #{o.order_number}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-bone-200/70">{o.email}</td>
                  <td className="px-4 py-3 text-bone-200/65">{o.shipping_city ?? '—'}</td>
                  <td className="px-4 py-3 text-bone-200/55">
                    {new Date(o.created_at).toLocaleDateString('en-GB', { dateStyle: 'short' })}
                  </td>
                  <td className="px-4 py-3 text-right text-bone-100 tabular-nums">{formatPrice(o.total_pence)}</td>
                  <td className="px-4 py-3 text-center">
                    <StatusBadge status={o.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-ink-700 border border-bone-200/8 p-12 text-center">
          <ShoppingBag size={32} className="text-bone-200/30 mx-auto mb-4" />
          <p className="text-bone-200/65">No orders {filter && filter !== 'all' ? `with status "${filter}"` : 'yet'}.</p>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: 'bg-bone-200/10 text-bone-200/70',
    paid: 'bg-ember/15 text-ember',
    shipped: 'bg-blue-500/15 text-blue-300',
    delivered: 'bg-green-500/15 text-green-300',
    cancelled: 'bg-red-500/15 text-red-300',
    refunded: 'bg-orange-500/15 text-orange-300',
  };
  return (
    <span className={`text-[10px] tracking-[0.15em] uppercase px-2 py-1 ${colors[status] ?? colors.pending}`}>
      {status}
    </span>
  );
}
