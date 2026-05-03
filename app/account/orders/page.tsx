import Link from 'next/link';
import { requireAuth } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { formatPrice } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

export const metadata = { title: 'Orders' };

export default async function OrdersPage() {
  const user = await requireAuth('/account/orders');
  const supabase = createClient();

  const { data: orders } = await supabase
    .from('orders')
    .select('order_number, status, total_pence, created_at, shipping_city')
    .eq('customer_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div>
      <header className="mb-10">
        <div className="eyebrow mb-3">Account</div>
        <h1 className="font-serif text-4xl lg:text-5xl text-bone-100 leading-[1]">
          Your <em className="italic text-ember">orders</em>.
        </h1>
      </header>

      {orders && orders.length > 0 ? (
        <div className="space-y-2">
          {orders.map((o) => (
            <Link
              key={o.order_number}
              href={`/account/orders/${o.order_number}`}
              className="flex items-center justify-between p-5 bg-ink-700 border border-bone-200/8 hover:border-ember/40 transition-colors"
            >
              <div>
                <div className="text-bone-100 mb-1">#{o.order_number}</div>
                <div className="text-xs text-bone-200/55">
                  {new Date(o.created_at).toLocaleDateString('en-GB', { dateStyle: 'medium' })}
                  {o.shipping_city && ` · ${o.shipping_city}`}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <StatusBadge status={o.status} />
                <span className="text-bone-100 tabular-nums">{formatPrice(o.total_pence)}</span>
                <ArrowRight size={14} className="text-bone-200/40" />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-ink-700 border border-bone-200/8 p-12 text-center">
          <p className="text-bone-200/65 mb-6 text-lg">No orders yet.</p>
          <Link href="/shop" className="btn-primary">Browse coffee →</Link>
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
