import type { SupabaseClient } from '@supabase/supabase-js';
import type { CartItem, Coupon, AppliedCoupon } from './types';
import { SUBSCRIPTION_DISCOUNT, calculateShipping } from './utils';

export type ValidateInput = {
  code: string;
  items: CartItem[];
  email?: string | null;
  customerId?: string | null;
};

export type ValidateOk = {
  ok: true;
  coupon: Coupon;
  applied: AppliedCoupon;
  eligibleSubtotalPence: number;
  subtotalPence: number;
  shippingPence: number;
};

export type ValidateErr = { ok: false; error: string };

export type ValidateResult = ValidateOk | ValidateErr;

function unitPence(item: CartItem): number {
  return item.isSubscription
    ? Math.round(item.unitPricePence * (1 - SUBSCRIPTION_DISCOUNT))
    : item.unitPricePence;
}

function lineTotal(item: CartItem): number {
  return unitPence(item) * item.quantity;
}

export function cartSubtotalPence(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + lineTotal(i), 0);
}

/** Subtotal of items eligible for the coupon, given the coupon's restrictions. */
export function eligibleSubtotalForCoupon(items: CartItem[], coupon: Coupon): number {
  return items.reduce((sum, item) => {
    if (item.isSubscription && !coupon.applies_to_subscription) return sum;
    if (!item.isSubscription && !coupon.applies_to_one_time) return sum;
    if (coupon.product_ids.length > 0 && !coupon.product_ids.includes(item.productId)) return sum;
    return sum + lineTotal(item);
  }, 0);
}

/** Pure discount calculation. Returns pence to subtract from order total. */
export function computeDiscountPence(
  coupon: Coupon,
  eligibleSubtotalPence: number,
  shippingPence: number
): { discountPence: number; freeShipping: boolean } {
  if (coupon.discount_type === 'free_shipping') {
    return { discountPence: shippingPence, freeShipping: true };
  }

  if (coupon.discount_type === 'percentage') {
    const raw = Math.floor((eligibleSubtotalPence * coupon.discount_value) / 100);
    const capped = coupon.max_discount_pence != null
      ? Math.min(raw, coupon.max_discount_pence)
      : raw;
    return { discountPence: Math.min(capped, eligibleSubtotalPence), freeShipping: false };
  }

  // fixed_amount
  return {
    discountPence: Math.min(coupon.discount_value, eligibleSubtotalPence),
    freeShipping: false,
  };
}

/**
 * Validate a coupon for a given cart. Performs DB lookups for the coupon row
 * and (when relevant) the customer's prior redemptions.
 *
 * Pass an admin (service-role) Supabase client — RLS blocks anon reads of coupons.
 */
export async function validateCouponForCart(
  db: SupabaseClient,
  input: ValidateInput
): Promise<ValidateResult> {
  const code = input.code.trim().toUpperCase();
  if (!code) return { ok: false, error: 'Enter a coupon code.' };
  if (!input.items?.length) return { ok: false, error: 'Your cart is empty.' };

  const { data: coupon, error } = await db
    .from('coupons')
    .select('*')
    .eq('code', code)
    .maybeSingle();

  if (error) return { ok: false, error: 'Could not check coupon.' };
  if (!coupon) return { ok: false, error: 'Invalid coupon code.' };
  if (!coupon.is_active) return { ok: false, error: 'This coupon is no longer active.' };

  const now = new Date();
  if (coupon.starts_at && new Date(coupon.starts_at) > now) {
    return { ok: false, error: 'This coupon is not yet active.' };
  }
  if (coupon.expires_at && new Date(coupon.expires_at) < now) {
    return { ok: false, error: 'This coupon has expired.' };
  }

  if (coupon.usage_limit != null && coupon.times_used >= coupon.usage_limit) {
    return { ok: false, error: 'This coupon has reached its usage limit.' };
  }

  const subtotalPence = cartSubtotalPence(input.items);
  if (subtotalPence < coupon.min_subtotal_pence) {
    const need = (coupon.min_subtotal_pence - subtotalPence) / 100;
    return {
      ok: false,
      error: `Add £${need.toFixed(2)} more to use this coupon (minimum £${(
        coupon.min_subtotal_pence / 100
      ).toFixed(2)}).`,
    };
  }

  const eligibleSubtotalPence = eligibleSubtotalForCoupon(input.items, coupon as Coupon);
  if (eligibleSubtotalPence === 0) {
    return { ok: false, error: 'No items in your cart qualify for this coupon.' };
  }

  // Per-customer redemption limit
  if (coupon.usage_limit_per_customer != null) {
    const identity = input.customerId
      ? { col: 'customer_id', val: input.customerId }
      : input.email
        ? { col: 'email', val: input.email.toLowerCase() }
        : null;

    if (identity) {
      const q = db
        .from('coupon_redemptions')
        .select('id', { count: 'exact', head: true })
        .eq('coupon_id', coupon.id);
      const { count } = identity.col === 'customer_id'
        ? await q.eq('customer_id', identity.val)
        : await q.ilike('email', identity.val);

      if ((count ?? 0) >= coupon.usage_limit_per_customer) {
        return { ok: false, error: 'You have already used this coupon.' };
      }
    }
  }

  // First-order-only
  if (coupon.first_order_only) {
    if (input.customerId) {
      const { count } = await db
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .eq('customer_id', input.customerId)
        .in('status', ['paid', 'shipped', 'delivered']);
      if ((count ?? 0) > 0) {
        return { ok: false, error: 'This coupon is for first-time customers only.' };
      }
    } else if (input.email) {
      const { count } = await db
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .ilike('email', input.email.toLowerCase())
        .in('status', ['paid', 'shipped', 'delivered']);
      if ((count ?? 0) > 0) {
        return { ok: false, error: 'This coupon is for first-time customers only.' };
      }
    }
  }

  const shippingPence = calculateShipping(subtotalPence);
  const { discountPence, freeShipping } = computeDiscountPence(
    coupon as Coupon,
    eligibleSubtotalPence,
    shippingPence
  );

  if (discountPence === 0) {
    return { ok: false, error: 'This coupon does not apply to your cart.' };
  }

  return {
    ok: true,
    coupon: coupon as Coupon,
    applied: {
      code: coupon.code,
      description: coupon.description,
      discount_type: coupon.discount_type,
      discount_pence: discountPence,
      free_shipping: freeShipping,
    },
    eligibleSubtotalPence,
    subtotalPence,
    shippingPence,
  };
}

/** Human-readable summary like "15% off (max £5)" or "£5 off orders over £30". */
export function describeCoupon(c: Coupon): string {
  const parts: string[] = [];
  if (c.discount_type === 'percentage') {
    let s = `${c.discount_value}% off`;
    if (c.max_discount_pence) s += ` (max £${(c.max_discount_pence / 100).toFixed(2)})`;
    parts.push(s);
  } else if (c.discount_type === 'fixed_amount') {
    parts.push(`£${(c.discount_value / 100).toFixed(2)} off`);
  } else {
    parts.push('Free shipping');
  }
  if (c.min_subtotal_pence > 0) {
    parts.push(`min £${(c.min_subtotal_pence / 100).toFixed(2)}`);
  }
  return parts.join(' · ');
}
