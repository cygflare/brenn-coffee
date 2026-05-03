import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { adminDb } from '@/lib/auth';
import { ProductForm } from '../ProductForm';
import { updateProductAction } from '../actions';
import { DeleteForm } from './DeleteForm';
import { VariantsEditor } from './VariantsEditor';

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

      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="eyebrow mb-2">Edit product</div>
          <h1 className="font-serif text-4xl text-bone-100 leading-[1]">{product.name}</h1>
          <p className="text-xs text-bone-200/40 mt-2">/{product.slug}</p>
        </div>
        <DeleteForm id={params.id} name={product.name} />
      </header>

      <ProductForm action={updateAction} product={product} submitLabel="Save changes" />

      <VariantsEditor productId={params.id} variants={product.variants ?? []} />
    </div>
  );
}

