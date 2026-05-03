import Link from 'next/link';
import { adminDb } from '@/lib/auth';
import { formatPrice } from '@/lib/utils';
import { ArrowRight, Package, AlertTriangle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const db = adminDb();

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [
    { data: paidOrders },
    { data: ordersThisWeek },
    { count: totalCustomers },
    { data: lowStock },
    { data: recentOrders },
  ] = await Promise.all([
    db.from('orders').select('total_pence').in('status', ['paid', 'shipped', 'delivered']),
    db
      .from('orders')
      .select('id', { count: 'exact' })
      .gte('created_at', sevenDaysAgo.toISOString())
      .in('status', ['paid', 'shipped', 'delivered']),
    db.from('customers').select('id', { count: 'exact', head: true }),
    db
      .from('products')
      .select('id, name, slug, inventory_kg, reorder_threshold_kg')
      .lt('inventory_kg', 10)
      .eq('is_active', true)
      .order('inventory_kg', { ascending: true })
      .limit(5),
    db
      .from('orders')
      .select('order_number, email, status, total_pence, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  const totalRevenue = (paidOrders ?? []).reduce((sum, o) => sum + (o.total_pence ?? 0), 0);
  const ordersThisWeekCount = ordersThisWeek?.length ?? 0;

  return (
    <div className="space-y-8">
      <header>
        <div className="eyebrow mb-2">Overview</div>
        <h1 className="font-serif text-4xl text-bone-100 leading-[1]">Dashboard</h1>
      </header>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="Total revenue" value={formatPrice(totalRevenue)} />
        <Stat label="Orders (7d)" value={ordersThisWeekCount.toString()} />
        <Stat label="Customers" value={(totalCustomers ?? 0).toString()} />
        <Stat label="Active products" value={`${(paidOrders?.length ?? 0) >= 0 ? '' : ''}—`} placeholder>
          <ProductCount db={db} />
        </Stat>
      </section>

      <section>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="font-serif text-2xl text-bone-100">Recent orders</h2>
          <Link href="/admin/orders" className="text-xs tracking-[0.15em] uppercase text-ember hover:text-ember-400">
            View all →
          </Link>
        </div>
        {recentOrders && recentOrders.length > 0 ? (
          <div className="border border-bone-200/8 divide-y divide-bone-200/8">
            {recentOrders.map((o) => (
              <Link
                key={o.order_number}
                href={`/admin/orders/${o.order_number}`}
                className="flex items-center justify-between p-4 bg-ink-700 hover:bg-ink-600 transition-colors"
              >
                <div>
                  <div className="text-sm text-bone-100">#{o.order_number}</div>
                  <div className="text-xs text-bone-200/55 mt-0.5">
                    {o.email} · {new Date(o.created_at).toLocaleDateString('en-GB', { dateStyle: 'medium' })}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={o.status} />
                  <span className="text-sm text-bone-100 tabular-nums">{formatPrice(o.total_pence)}</span>
                  <ArrowRight size={14} className="text-bone-200/40" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-bone-200/55 text-sm">No orders yet.</p>
        )}
      </section>

      <section>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="font-serif text-2xl text-bone-100 flex items-center gap-2">
            <AlertTriangle size={18} className="text-ember" />
            Low stock
          </h2>
          <Link href="/admin/products" className="text-xs tracking-[0.15em] uppercase text-ember hover:text-ember-400">
            All products →
          </Link>
        </div>
        {lowStock && lowStock.length > 0 ? (
          <div className="border border-bone-200/8 divide-y divide-bone-200/8">
            {lowStock.map((p) => (
              <Link
                key={p.id}
                href={`/admin/products/${p.id}`}
                className="flex items-center justify-between p-4 bg-ink-700 hover:bg-ink-600 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Package size={16} className="text-bone-200/40" />
                  <span className="text-bone-100">{p.name}</span>
                </div>
                <span className={`text-sm tabular-nums ${p.inventory_kg < (p.reorder_threshold_kg ?? 5) ? 'text-ember' : 'text-bone-200/65'}`}>
                  {p.inventory_kg}kg left
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-bone-200/55 text-sm">All products are well-stocked.</p>
        )}
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  children,
  placeholder,
}: {
  label: string;
  value: string;
  children?: React.ReactNode;
  placeholder?: boolean;
}) {
  return (
    <div className="bg-ink-700 border border-bone-200/8 p-5">
      <div className="text-xs tracking-[0.15em] uppercase text-bone-200/50 mb-2">{label}</div>
      <div className="font-serif text-3xl text-bone-100 tabular-nums">{children ?? value}</div>
    </div>
  );
}

async function ProductCount({ db }: { db: ReturnType<typeof adminDb> }) {
  const { count } = await db
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('is_active', true);
  return <>{count ?? 0}</>;
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
