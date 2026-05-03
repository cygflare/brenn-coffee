import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { adminDb } from '@/lib/auth';
import { formatPrice } from '@/lib/utils';
import { OrderUpdateForm } from './OrderUpdateForm';

export const metadata = { title: 'Order detail', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

export default async function AdminOrderDetail({ params }: { params: { orderNumber: string } }) {
  const db = adminDb();
  const { data: order } = await db
    .from('orders')
    .select('*, items:order_items(*)')
    .eq('order_number', params.orderNumber)
    .single();

  if (!order) notFound();

  const placedAt = new Date(order.created_at);

  return (
    <div className="space-y-6">
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-2 text-xs tracking-[0.15em] uppercase text-bone-200/60 hover:text-ember"
      >
        <ArrowLeft size={12} />
        All orders
      </Link>

      <header>
        <div className="eyebrow mb-2">Order #{order.order_number}</div>
        <h1 className="font-serif text-3xl text-bone-100 leading-[1] mb-2">
          {order.shipping_name ?? order.email}
        </h1>
        <p className="text-sm text-bone-200/55">
          Placed {placedAt.toLocaleDateString('en-GB', { dateStyle: 'long' })} at{' '}
          {placedAt.toLocaleTimeString('en-GB', { timeStyle: 'short' })} · {order.email}
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
        <div className="space-y-6">
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
              <h2 className="text-xs tracking-[0.15em] uppercase text-bone-200/60 mb-4">Ship to</h2>
              <address className="not-italic text-sm text-bone-100 leading-relaxed">
                {order.shipping_name}<br />
                {order.shipping_line1}<br />
                {order.shipping_line2 && <>{order.shipping_line2}<br /></>}
                {order.shipping_city} {order.shipping_postcode}<br />
                {order.shipping_country}
              </address>
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
                {order.stripe_payment_intent_id && (
                  <div className="pt-3 mt-3 text-xs text-bone-200/40">
                    Stripe PI: <span className="font-mono">{order.stripe_payment_intent_id}</span>
                  </div>
                )}
              </dl>
            </div>
          </section>
        </div>

        <aside>
          <div className="sticky top-24">
            <h2 className="text-xs tracking-[0.15em] uppercase text-ember mb-4">Update order</h2>
            <OrderUpdateForm
              orderNumber={order.order_number}
              currentStatus={order.status}
              currentTrackingNumber={order.tracking_number ?? ''}
              currentTrackingUrl={order.tracking_url ?? ''}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between">
      <dt className={bold ? 'text-bone-100' : 'text-bone-200/65'}>{label}</dt>
      <dd className={`tabular-nums ${bold ? 'text-bone-100 font-medium' : 'text-bone-100'}`}>{value}</dd>
    </div>
  );
}
