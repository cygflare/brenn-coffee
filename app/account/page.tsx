import Link from 'next/link';
import { requireAuth } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { formatPrice } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

export default async function AccountPage() {
  const user = await requireAuth('/account');
  const supabase = createClient();

  const { data: recentOrders } = await supabase
    .from('orders')
    .select('order_number, status, total_pence, created_at')
    .eq('customer_id', user.id)
    .order('created_at', { ascending: false })
    .limit(3);

  return (
    <div className="space-y-12">
      <header>
        <div className="eyebrow mb-3">Account</div>
        <h1 className="font-serif text-4xl lg:text-5xl text-bone-100 leading-[1] mb-4">
          {user.first_name ? `Welcome back, ${user.first_name}.` : 'Welcome back.'}
        </h1>
      </header>

      <section>
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="font-serif text-2xl text-bone-100">Recent orders</h2>
          <Link href="/account/orders" className="text-xs tracking-[0.15em] uppercase text-ember hover:text-ember-400">
            View all →
          </Link>
        </div>

        {recentOrders && recentOrders.length > 0 ? (
          <div className="space-y-2">
            {recentOrders.map((o) => (
              <Link
                key={o.order_number}
                href={`/account/orders/${o.order_number}`}
                className="flex items-center justify-between p-4 bg-ink-700 border border-bone-200/8 hover:border-ember/40 transition-colors"
              >
                <div>
                  <div className="text-sm text-bone-100 mb-0.5">#{o.order_number}</div>
                  <div className="text-xs text-bone-200/55">
                    {new Date(o.created_at).toLocaleDateString('en-GB', { dateStyle: 'medium' })}
                    {' · '}
                    <span className="text-ember/80 capitalize">{o.status}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-bone-100">{formatPrice(o.total_pence)}</span>
                  <ArrowRight size={14} className="text-bone-200/40" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-ink-700 border border-bone-200/8 p-8 text-center">
            <p className="text-bone-200/65 mb-6">You haven't placed any orders yet.</p>
            <Link href="/shop" className="btn-primary">Browse coffee →</Link>
          </div>
        )}
      </section>

      <section>
        <h2 className="font-serif text-2xl text-bone-100 mb-6">Profile</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5 text-sm">
          <Row label="Email" value={user.email} />
          <Row label="Name" value={[user.first_name, user.last_name].filter(Boolean).join(' ') || '—'} />
        </dl>
        <p className="text-xs text-bone-200/40 mt-6">
          Profile editing coming soon. To change your email or password, use the forgot-password flow.
        </p>
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs tracking-[0.15em] uppercase text-bone-200/50 mb-1.5">{label}</dt>
      <dd className="text-bone-100">{value}</dd>
    </div>
  );
}
