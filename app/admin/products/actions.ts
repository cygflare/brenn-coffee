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

// ============================================================================
// VARIANT ACTIONS
// ============================================================================

export type VariantFormResult = { error?: string; ok?: boolean };

const ALLOWED_GRINDS = ['whole_bean', 'espresso', 'filter', 'french_press', 'moka_pot'];

function parseVariantForm(formData: FormData) {
  const size_g = Number(formData.get('size_g'));
  const grind = String(formData.get('grind') ?? '').trim();
  const priceGbp = Number(formData.get('price_gbp'));
  const skuRaw = String(formData.get('sku') ?? '').trim();
  const is_active = formData.get('is_active') === 'on';

  if (!size_g || size_g <= 0) return { error: 'Size must be greater than 0.' as const };
  if (!ALLOWED_GRINDS.includes(grind)) return { error: 'Invalid grind type.' as const };
  if (!priceGbp || priceGbp <= 0) return { error: 'Price must be greater than 0.' as const };

  return {
    data: {
      size_g: Math.round(size_g),
      grind,
      price_pence: Math.round(priceGbp * 100),
      sku: skuRaw || null,
      is_active,
    },
  };
}

export async function createVariantAction(
  productId: string,
  _prev: VariantFormResult,
  formData: FormData
): Promise<VariantFormResult> {
  await requireAdmin();
  const parsed = parseVariantForm(formData);
  if ('error' in parsed) return { error: parsed.error };

  const db = adminDb();

  // Auto-generate SKU if not supplied
  let sku = parsed.data.sku;
  if (!sku) {
    const { data: product } = await db
      .from('products')
      .select('slug')
      .eq('id', productId)
      .single();
    if (product?.slug) {
      sku = `${product.slug.toUpperCase()}-${parsed.data.size_g}-${parsed.data.grind.slice(0, 3).toUpperCase()}`;
    }
  }

  const { error } = await db.from('product_variants').insert({
    product_id: productId,
    ...parsed.data,
    sku,
  });

  if (error) {
    if (error.code === '23505') return { error: 'A variant with that SKU already exists.' };
    return { error: error.message };
  }

  revalidatePath(`/admin/products/${productId}`);
  revalidatePath('/shop');
  return { ok: true };
}

export async function updateVariantAction(
  variantId: string,
  productId: string,
  _prev: VariantFormResult,
  formData: FormData
): Promise<VariantFormResult> {
  await requireAdmin();
  const parsed = parseVariantForm(formData);
  if ('error' in parsed) return { error: parsed.error };

  const db = adminDb();
  const { error } = await db
    .from('product_variants')
    .update(parsed.data)
    .eq('id', variantId);

  if (error) {
    if (error.code === '23505') return { error: 'A variant with that SKU already exists.' };
    return { error: error.message };
  }

  revalidatePath(`/admin/products/${productId}`);
  revalidatePath('/shop');
  return { ok: true };
}

export async function deleteVariantAction(variantId: string, productId: string) {
  await requireAdmin();
  const db = adminDb();
  await db.from('product_variants').delete().eq('id', variantId);
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath('/shop');
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
