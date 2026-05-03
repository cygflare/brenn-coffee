import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { adminDb } from '@/lib/auth';
import { ProductForm } from '../ProductForm';
import { updateProductAction } from '../actions';
import { DeleteForm } from './DeleteForm';

export const metadata = { title: 'Edit product', robots: { index: false, follow: false } };

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const db = adminDb();
  const { data: product } = await db
    .from('products')
    .select('*, variants:product_variants(id, size_g, grind, price_pence, sku, is_active)')
    .eq('id', params.id)
    .single();

  if (!product) notFound();

  const updateAction = updateProductAction.bind(null, params.id);

  return (
    <div>
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-2 text-xs tracking-[0.15em] uppercase text-bone-200/60 hover:text-ember mb-6"
      >
        <ArrowLeft size={12} />
        All products
      </Link>

      <header className="mb-10 flex items-start justify-between gap-4">
        <div>
          <div className="eyebrow mb-3">Edit product</div>
          <h1 className="font-serif text-4xl text-bone-100 leading-[1]">{product.name}</h1>
          <p className="text-xs text-bone-200/40 mt-2">/{product.slug}</p>
        </div>
        <DeleteForm id={params.id} name={product.name} />
      </header>

      <ProductForm action={updateAction} product={product} submitLabel="Save changes" />

      {product.variants && product.variants.length > 0 && (
        <section className="mt-16 pt-10 border-t border-bone-200/10">
          <h2 className="font-serif text-2xl text-bone-100 mb-2">Variants</h2>
          <p className="text-xs text-bone-200/55 mb-6">
            {product.variants.length} variants. Edit individual prices via Supabase Table Editor → product_variants.
          </p>
          <div className="border border-bone-200/8">
            <table className="w-full text-sm">
              <thead className="bg-ink-700">
                <tr className="text-left text-xs tracking-[0.15em] uppercase text-bone-200/55">
                  <th className="px-4 py-2.5 font-normal">SKU</th>
                  <th className="px-4 py-2.5 font-normal">Size</th>
                  <th className="px-4 py-2.5 font-normal">Grind</th>
                  <th className="px-4 py-2.5 font-normal text-right">Price</th>
                  <th className="px-4 py-2.5 font-normal text-center">Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bone-200/8">
                {product.variants.map((v: any) => (
                  <tr key={v.id} className="bg-ink-700/40">
                    <td className="px-4 py-2.5 text-bone-200/70 font-mono text-xs">{v.sku}</td>
                    <td className="px-4 py-2.5 text-bone-100">{v.size_g}g</td>
                    <td className="px-4 py-2.5 text-bone-200/70 capitalize">{v.grind.replace('_', ' ')}</td>
                    <td className="px-4 py-2.5 text-right text-bone-100 tabular-nums">
                      £{(v.price_pence / 100).toFixed(2)}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      {v.is_active ? '✓' : <span className="text-bone-200/40">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

