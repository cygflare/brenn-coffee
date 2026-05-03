import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createAdminClient, createClient } from '@/lib/supabase/server';
import { calculateShipping, SUBSCRIPTION_DISCOUNT } from '@/lib/utils';
import { validateCouponForCart } from '@/lib/coupons';
import type { CartItem } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const { items, email, couponCode } = (await req.json()) as {
      items: CartItem[];
      email: string;
      couponCode?: string | null;
    };

    if (!items?.length || !email) {
      return NextResponse.json({ error: 'Missing items or email' }, { status: 400 });
    }

    const userClient = createClient();
    const {
      data: { user },
    } = await userClient.auth.getUser();
    const customerId = user?.id ?? null;

    // Re-fetch product/variant data from DB so we don't trust client prices
    const supabase = createAdminClient();
    const variantIds = Array.from(new Set(items.map((i) => i.variantId)));

    const { data: variants, error } = await supabase
      .from('product_variants')
      .select('id, price_pence, size_g, grind, product_id, products(name, slug)')
      .in('id', variantIds);

    if (error || !variants) {
      console.error('Variant fetch error:', error);
      return NextResponse.json({ error: 'Could not load variants' }, { status: 500 });
    }

    const variantMap = new Map(variants.map((v) => [v.id, v]));

    // Build sanitized cart with verified prices and product_ids
    const sanitizedItems: CartItem[] = items
      .map((i) => {
        const v = variantMap.get(i.variantId);
        if (!v) return null;
        return {
          ...i,
          productId: v.product_id,
          unitPricePence: v.price_pence,
          quantity: Math.max(1, Math.floor(i.quantity)),
        };
      })
      .filter((x): x is CartItem => x !== null);

    // Build Stripe line items with verified prices
    const line_items = sanitizedItems.map((item) => {
      const variant = variantMap.get(item.variantId)!;
      const product = Array.isArray(variant.products) ? variant.products[0] : variant.products;
      const basePrice = variant.price_pence;
      const finalPrice = item.isSubscription
        ? Math.round(basePrice * (1 - SUBSCRIPTION_DISCOUNT))
        : basePrice;

      return {
        price_data: {
          currency: 'gbp',
          product_data: {
            name: `${product.name} · ${variant.size_g}g · ${variant.grind.replace('_', ' ')}`,
            description: item.isSubscription
              ? 'Subscription · 15% off · Skip or cancel anytime'
              : undefined,
          },
          unit_amount: finalPrice,
        },
        quantity: item.quantity,
      };
    });

    // Calculate subtotal for shipping
    const subtotal = sanitizedItems.reduce((sum, item) => {
      const v = variantMap.get(item.variantId);
      if (!v) return sum;
      const price = item.isSubscription
        ? v.price_pence * (1 - SUBSCRIPTION_DISCOUNT)
        : v.price_pence;
      return sum + price * item.quantity;
    }, 0);

    let shippingPence = calculateShipping(subtotal);
    let stripeDiscounts: { coupon: string }[] | undefined;
    let appliedCouponCode: string | null = null;
    let appliedDiscountPence = 0;
    let appliedCouponId: string | null = null;

    // Validate + apply coupon (server-side authoritative)
    if (couponCode) {
      const result = await validateCouponForCart(supabase, {
        code: couponCode,
        items: sanitizedItems,
        email,
        customerId,
      });

      if (!result.ok) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }

      appliedCouponCode = result.coupon.code;
      appliedCouponId = result.coupon.id;

      if (result.applied.free_shipping) {
        shippingPence = 0;
        appliedDiscountPence = result.shippingPence;
      } else {
        appliedDiscountPence = result.applied.discount_pence;
        // Create a one-shot Stripe coupon for the exact amount, attach to session
        const stripeCoupon = await stripe.coupons.create({
          amount_off: result.applied.discount_pence,
          currency: 'gbp',
          duration: 'once',
          name: `${result.coupon.code} (${(result.applied.discount_pence / 100).toFixed(2)} off)`,
          max_redemptions: 1,
        });
        stripeDiscounts = [{ coupon: stripeCoupon.id }];
      }
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items,
      customer_email: email,
      shipping_address_collection: { allowed_countries: ['GB'] },
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: shippingPence, currency: 'gbp' },
            display_name: shippingPence === 0 ? 'Free UK shipping' : 'Standard UK shipping',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 2 },
              maximum: { unit: 'business_day', value: 4 },
            },
          },
        },
      ],
      ...(stripeDiscounts ? { discounts: stripeDiscounts } : {}),
      // Stripe rejects allow_promotion_codes when discounts are set
      ...(stripeDiscounts ? {} : { allow_promotion_codes: false }),
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout`,
      metadata: {
        item_count: sanitizedItems.length.toString(),
        ...(customerId && { customer_id: customerId }),
        ...(appliedCouponCode && {
          coupon_code: appliedCouponCode,
          coupon_id: appliedCouponId!,
          discount_pence: appliedDiscountPence.toString(),
        }),
        cart_data: JSON.stringify(
          sanitizedItems.map((i) => ({
            v: i.variantId,
            q: i.quantity,
            s: i.isSubscription ? 1 : 0,
          }))
        ).slice(0, 500),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('Checkout error:', err);
    return NextResponse.json(
      { error: err.message || 'Checkout failed' },
      { status: 500 }
    );
  }
}
