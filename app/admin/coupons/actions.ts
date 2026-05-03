'use server';

import { adminDb, requireAdmin } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export type CouponFormResult = { error?: string };

function parseCouponForm(formData: FormData) {
  const codeRaw = String(formData.get('code') ?? '').trim().toUpperCase();
  if (!codeRaw) return { error: 'Code is required.' as const };
  if (!/^[A-Z0-9_-]+$/.test(codeRaw)) {
    return { error: 'Code can only contain letters, numbers, hyphens, underscores.' as const };
  }

  const discount_type = String(formData.get('discount_type') ?? '');
  if (!['percentage', 'fixed_amount', 'free_shipping'].includes(discount_type)) {
    return { error: 'Invalid discount type.' as const };
  }

  const num = (k: string): number | null => {
    const v = formData.get(k);
    if (v === null || v === '') return null;
    const n = Number(v);
    return isNaN(n) ? null : n;
  };

  let discount_value = 0;
  if (discount_type === 'percentage') {
    const pct = num('discount_value_pct') ?? 0;
    if (pct <= 0 || pct > 100) {
      return { error: 'Percentage must be between 1 and 100.' as const };
    }
    discount_value = Math.round(pct);
  } else if (discount_type === 'fixed_amount') {
    const gbp = num('discount_value_gbp') ?? 0;
    if (gbp <= 0) {
      return { error: 'Fixed amount must be greater than zero.' as const };
    }
    discount_value = Math.round(gbp * 100);
  } else {
    discount_value = 0; // free_shipping has no value
  }

  const min_subtotal_gbp = num('min_subtotal_gbp') ?? 0;
  const max_discount_gbp = num('max_discount_gbp');

  const dt = (k: string): string | null => {
    const v = formData.get(k);
    if (v === null || v === '') return null;
    const s = String(v);
    return s ? new Date(s).toISOString() : null;
  };

  const productIdsRaw = String(formData.get('product_ids') ?? '').trim();
  const product_ids = productIdsRaw
    ? productIdsRaw.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  return {
    data: {
      code: codeRaw,
      description: String(formData.get('description') ?? '').trim() || null,
      discount_type,
      discount_value,
      min_subtotal_pence: Math.round(min_subtotal_gbp * 100),
      max_discount_pence:
        max_discount_gbp != null && max_discount_gbp > 0 ? Math.round(max_discount_gbp * 100) : null,
      usage_limit: num('usage_limit') ?? null,
      usage_limit_per_customer: num('usage_limit_per_customer') ?? null,
      starts_at: dt('starts_at'),
      expires_at: dt('expires_at'),
      is_active: formData.get('is_active') === 'on',
      first_order_only: formData.get('first_order_only') === 'on',
      applies_to_subscription: formData.get('applies_to_subscription') === 'on',
      applies_to_one_time: formData.get('applies_to_one_time') === 'on',
      product_ids,
    },
  };
}

export async function createCouponAction(
  _prev: CouponFormResult,
  formData: FormData
): Promise<CouponFormResult> {
  const admin = await requireAdmin();
  const parsed = parseCouponForm(formData);
  if ('error' in parsed) return { error: parsed.error };

  if (!parsed.data.applies_to_subscription && !parsed.data.applies_to_one_time) {
    return { error: 'Coupon must apply to at least one purchase type.' };
  }

  const db = adminDb();
  const { data, error } = await db
    .from('coupons')
    .insert({ ...parsed.data, created_by: admin.id })
    .select('id')
    .single();

  if (error || !data) {
    if (error?.code === '23505') return { error: 'A coupon with that code already exists.' };
    return { error: error?.message ?? 'Could not create coupon.' };
  }

  revalidatePath('/admin/coupons');
  redirect(`/admin/coupons/${data.id}`);
}

export async function updateCouponAction(
  id: string,
  _prev: CouponFormResult,
  formData: FormData
): Promise<CouponFormResult> {
  await requireAdmin();
  const parsed = parseCouponForm(formData);
  if ('error' in parsed) return { error: parsed.error };

  if (!parsed.data.applies_to_subscription && !parsed.data.applies_to_one_time) {
    return { error: 'Coupon must apply to at least one purchase type.' };
  }

  const db = adminDb();
  const { error } = await db.from('coupons').update(parsed.data).eq('id', id);
  if (error) {
    if (error.code === '23505') return { error: 'A coupon with that code already exists.' };
    return { error: error.message };
  }

  revalidatePath('/admin/coupons');
  revalidatePath(`/admin/coupons/${id}`);
  return {};
}

export async function deleteCouponAction(id: string) {
  await requireAdmin();
  const db = adminDb();
  await db.from('coupons').delete().eq('id', id);
  revalidatePath('/admin/coupons');
  redirect('/admin/coupons');
}

export async function toggleCouponActiveAction(id: string, nextActive: boolean) {
  await requireAdmin();
  const db = adminDb();
  await db.from('coupons').update({ is_active: nextActive }).eq('id', id);
  revalidatePath('/admin/coupons');
  revalidatePath(`/admin/coupons/${id}`);
}
