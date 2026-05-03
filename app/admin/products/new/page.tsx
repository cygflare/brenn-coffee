import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ProductForm } from '../ProductForm';
import { createProductAction } from '../actions';

export const metadata = { title: 'New product', robots: { index: false, follow: false } };

export default function NewProductPage() {
  return (
    <div>
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-2 text-xs tracking-[0.15em] uppercase text-bone-200/60 hover:text-ember mb-6"
      >
        <ArrowLeft size={12} />
        All products
      </Link>

      <header className="mb-6">
        <div className="eyebrow mb-2">Catalog</div>
        <h1 className="font-serif text-4xl text-bone-100 leading-[1] mb-3">New product</h1>
        <p className="text-sm text-bone-200/55">
          Saving will auto-generate 8 variants (4 sizes × whole-bean + 4 grinds @ 250g) with calculated prices.
          Variant prices can be edited individually later via the Supabase Table Editor.
        </p>
      </header>

      <ProductForm action={createProductAction} submitLabel="Create product" />
    </div>
  );
}
