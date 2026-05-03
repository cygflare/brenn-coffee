'use server';

import { adminDb, requireAdmin } from '@/lib/auth';
import { slugify } from '@/lib/utils';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export type ProductFormResult = { error?: string };

export async function createProductAction(
  _prev: ProductFormResult,
  formData: FormData
): Promise<ProductFormResult> {
  await requireAdmin();
  const db = adminDb();

  const data = parseProductForm(formData);
  if (!data.name || !data.origin) {
    return { error: 'Name and origin are required.' };
  }

  const slug = data.slug || slugify(data.name);

  const { data: product, error } = await db
    .from('products')
    .insert({ ...data, slug })
    .select('id')
    .single();

  if (error || !product) {
    return { error: error?.message ?? 'Could not create product.' };
  }

  // Auto-generate the standard 8 variants (matches schema.sql seed pattern)
  const variants = [
    { size_g: 125, grind: 'whole_bean', mult: 0.58 },
    { size_g: 250, grind: 'whole_bean', mult: 1 },
    { size_g: 500, grind: 'whole_bean', mult: 1.84 },
    { size_g: 1000, grind: 'whole_bean', mult: 3.26 },
    { size_g: 250, grind: 'espresso', mult: 1 },
    { size_g: 250, grind: 'filter', mult: 1 },
    { size_g: 250, grind: 'french_press', mult: 1 },
    { size_g: 250, grind: 'moka_pot', mult: 1 },
  ];

  await db.from('product_variants').insert(
    variants.map((v) => ({
      product_id: product.id,
      size_g: v.size_g,
      grind: v.grind,
      price_pence: Math.round(data.price_pence * v.mult),
      sku: `${slug.toUpperCase()}-${v.size_g}-${v.grind.slice(0, 3).toUpperCase()}`,
    }))
  );

  revalidatePath('/admin/products');
  revalidatePath('/shop');
  redirect(`/admin/products/${product.id}`);
}

export async function updateProductAction(
  id: string,
  _prev: ProductFormResult,
  formData: FormData
): Promise<ProductFormResult> {
  await requireAdmin();
  const db = adminDb();

  const data = parseProductForm(formData);
  if (!data.name || !data.origin) {
    return { error: 'Name and origin are required.' };
  }

  const { error } = await db
    .from('products')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) return { error: error.message };

  revalidatePath('/admin/products');
  revalidatePath(`/admin/products/${id}`);
  revalidatePath('/shop');
  if (data.slug) revalidatePath(`/product/${data.slug}`);
  return {};
}

export async function deleteProductAction(id: string) {
  await requireAdmin();
  const db = adminDb();
  await db.from('products').delete().eq('id', id);
  revalidatePath('/admin/products');
  revalidatePath('/shop');
  redirect('/admin/products');
}

function parseProductForm(formData: FormData) {
  const flavorNotes = String(formData.get('flavor_notes') ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const num = (k: string): number | null => {
    const v = formData.get(k);
    if (v === null || v === '') return null;
    const n = Number(v);
    return isNaN(n) ? null : n;
  };

  const required = (k: string): number => {
    const v = num(k);
    return v ?? 0;
  };

  return {
    slug: String(formData.get('slug') ?? '').trim(),
    name: String(formData.get('name') ?? '').trim(),
    origin: String(formData.get('origin') ?? '').trim(),
    country: String(formData.get('country') ?? '').trim() || null,
    tagline: String(formData.get('tagline') ?? '').trim() || null,
    description: String(formData.get('description') ?? '').trim() || null,
    roast_level: required('roast_level'),
    process: String(formData.get('process') ?? '').trim() || null,
    altitude_m: num('altitude_m'),
    variety: String(formData.get('variety') ?? '').trim() || null,
    cupping_score: num('cupping_score'),
    flavor_notes: flavorNotes,
    farm_name: String(formData.get('farm_name') ?? '').trim() || null,
    farmer_name: String(formData.get('farmer_name') ?? '').trim() || null,
    hero_image_url: String(formData.get('hero_image_url') ?? '').trim() || null,
    price_pence: Math.round((num('price_gbp') ?? 0) * 100),
    is_active: formData.get('is_active') === 'on',
    is_featured: formData.get('is_featured') === 'on',
    is_limited: formData.get('is_limited') === 'on',
    inventory_kg: num('inventory_kg') ?? 0,
  };
}
