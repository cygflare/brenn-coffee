import Link from 'next/link';
import { adminDb } from '@/lib/auth';
import { formatPrice, roastLabel } from '@/lib/utils';
import { Plus, Package } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminProductsPage() {
  const db = adminDb();
  const { data: products } = await db
    .from('products')
    .select('id, slug, name, origin, roast_level, price_pence, inventory_kg, is_active, is_featured')
    .order('created_at', { ascending: false });

  return (
    <div>
      <header className="mb-6 flex items-center justify-between">
        <div>
          <div className="eyebrow mb-2">Catalog</div>
          <h1 className="font-serif text-4xl text-bone-100 leading-[1]">Products</h1>
        </div>
        <Link href="/admin/products/new" className="btn-primary inline-flex items-center gap-2">
          <Plus size={16} />
          New product
        </Link>
      </header>

      {products && products.length > 0 ? (
        <div className="border border-bone-200/8">
          <table className="w-full text-sm">
            <thead className="bg-ink-700">
              <tr className="text-left text-xs tracking-[0.15em] uppercase text-bone-200/55">
                <th className="px-4 py-3 font-normal">Name</th>
                <th className="px-4 py-3 font-normal">Origin</th>
                <th className="px-4 py-3 font-normal">Roast</th>
                <th className="px-4 py-3 font-normal text-right">Price</th>
                <th className="px-4 py-3 font-normal text-right">Stock</th>
                <th className="px-4 py-3 font-normal text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bone-200/8">
              {products.map((p) => (
                <tr key={p.id} className="bg-ink-700/40 hover:bg-ink-700 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/admin/products/${p.id}`} className="text-bone-100 hover:text-ember">
                      {p.name}
                      {p.is_featured && (
                        <span className="ml-2 text-[10px] tracking-[0.15em] uppercase text-ember/70">Featured</span>
                      )}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-bone-200/65">{p.origin}</td>
                  <td className="px-4 py-3 text-bone-200/65">{roastLabel(p.roast_level)}</td>
                  <td className="px-4 py-3 text-right text-bone-100 tabular-nums">{formatPrice(p.price_pence)}</td>
                  <td className={`px-4 py-3 text-right tabular-nums ${p.inventory_kg < 5 ? 'text-ember' : 'text-bone-200/65'}`}>
                    {p.inventory_kg}kg
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-[10px] tracking-[0.15em] uppercase px-2 py-1 ${p.is_active ? 'bg-green-500/15 text-green-300' : 'bg-bone-200/10 text-bone-200/55'}`}>
                      {p.is_active ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-ink-700 border border-bone-200/8 p-12 text-center">
          <Package size={32} className="text-bone-200/30 mx-auto mb-4" />
          <p className="text-bone-200/65 mb-6">No products yet.</p>
          <Link href="/admin/products/new" className="btn-primary">Add your first product</Link>
        </div>
      )}
    </div>
  );
}
