import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAuth } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { formatPrice } from '@/lib/utils';
import { ArrowLeft } from 'lucide-react';

export const metadata = { title: 'Order detail', robots: { index: false, follow: false } };

export default async function OrderDetailPage({ params }: { params: { orderNumber: string } }) {
  const user = await requireAuth(`/account/orders/${params.orderNumber}`);
  const supabase = createClient();

  const { data: order } = await supabase
    .from('orders')
    .select('*, items:order_items(*)')
    .eq('order_number', params.orderNumber)
    .eq('customer_id', user.id)
    .single();

  if (!order) notFound();

  const placedAt = new Date(order.created_at);

  return (
    <div className="space-y-10">
      <Link
        href="/account/orders"
        className="inline-flex items-center gap-2 text-xs tracking-[0.15em] uppercase text-bone-200/60 hover:text-ember"
      >
        <ArrowLeft size={12} />
        All orders
      </Link>

      <header>
        <div className="eyebrow mb-3">Order #{order.order_number}</div>
        <h1 className="font-serif text-4xl text-bone-100 leading-[1] mb-3">
          {statusHeading(order.status)}
        </h1>
        <p className="text-sm text-bone-200/55">
          Placed {placedAt.toLocaleDateString('en-GB', { dateStyle: 'long' })} at{' '}
          {placedAt.toLocaleTimeString('en-GB', { timeStyle: 'short' })}
        </p>
      </header>

      <section>
        <h2 className="text-xs tracking-[0.15em] uppercase text-bone-200/60 mb-4">Items</h2>
        <div className="border border-bone-200/8 divide-y divide-bone-200/8">
          {(order.items ?? []).map((item: any) => (
            <div key={item.id} className="flex items-center justify-between p-4 bg-ink-700">
              <div>
                <div className="text-bone-100">{item.product_name}</div>
                <div className="text-xs text-bone-200/55 mt-0.5">
                  {item.variant_label} · ×{item.quantity}
                </div>
              </div>
              <div className="text-bone-100 tabular-nums">{formatPrice(item.line_total_pence)}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xs tracking-[0.15em] uppercase text-bone-200/60 mb-4">Shipping address</h2>
          <address className="not-italic text-sm text-bone-100 leading-relaxed">
            {order.shipping_name}<br />
            {order.shipping_line1}<br />
            {order.shipping_line2 && <>{order.shipping_line2}<br /></>}
            {order.shipping_city} {order.shipping_postcode}<br />
            {order.shipping_country}
          </address>
          {order.tracking_number && (
            <div className="mt-4 text-sm">
              <div className="text-xs tracking-[0.15em] uppercase text-bone-200/60 mb-1">Tracking</div>
              {order.tracking_url ? (
                <a href={order.tracking_url} target="_blank" rel="noopener noreferrer" className="text-ember hover:text-ember-400">
                  {order.tracking_number} →
                </a>
              ) : (
                <span className="text-bone-100">{order.tracking_number}</span>
              )}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xs tracking-[0.15em] uppercase text-bone-200/60 mb-4">Summary</h2>
          <dl className="space-y-2 text-sm">
            <Row label="Subtotal" value={formatPrice(order.subtotal_pence)} />
            <Row label="Shipping" value={order.shipping_pence === 0 ? 'Free' : formatPrice(order.shipping_pence)} />
            {order.discount_pence > 0 && (
              <Row label="Discount" value={`-${formatPrice(order.discount_pence)}`} />
            )}
            <div className="pt-2 mt-2 border-t border-bone-200/10">
              <Row label="Total" value={formatPrice(order.total_pence)} bold />
            </div>
          </dl>
        </div>
      </section>
    </div>
  );
}

function statusHeading(status: string): string {
  switch (status) {
    case 'paid': return 'Paid · awaiting roast';
    case 'shipped': return 'On its way';
    case 'delivered': return 'Delivered';
    case 'cancelled': return 'Cancelled';
    case 'refunded': return 'Refunded';
    default: return 'Pending';
  }
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between">
      <dt className={bold ? 'text-bone-100' : 'text-bone-200/65'}>{label}</dt>
      <dd className={`tabular-nums ${bold ? 'text-bone-100 font-medium' : 'text-bone-100'}`}>{value}</dd>
    </div>
  );
}
