import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createAdminClient, createClient } from '@/lib/supabase/server';
import { calculateShipping, SUBSCRIPTION_DISCOUNT } from '@/lib/utils';
import type { CartItem } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const { items, email } = (await req.json()) as {
      items: CartItem[];
      email: string;
    };

    if (!items?.length || !email) {
      return NextResponse.json({ error: 'Missing items or email' }, { status: 400 });
    }

    // If the buyer is signed in, attach their customer_id to the Stripe session
    // metadata so the webhook can link the order back to them.
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
      .select('id, price_pence, size_g, grind, products(name, slug)')
      .in('id', variantIds);

    if (error || !variants) {
      console.error('Variant fetch error:', error);
      return NextResponse.json({ error: 'Could not load variants' }, { status: 500 });
    }

    const variantMap = new Map(variants.map((v) => [v.id, v]));

    // Build Stripe line items with verified prices
    const line_items = items.map((item) => {
      const variant = variantMap.get(item.variantId);
      if (!variant) throw new Error(`Variant ${item.variantId} not found`);

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
    const subtotal = items.reduce((sum, item) => {
      const v = variantMap.get(item.variantId);
      if (!v) return sum;
      const price = item.isSubscription
        ? v.price_pence * (1 - SUBSCRIPTION_DISCOUNT)
        : v.price_pence;
      return sum + price * item.quantity;
    }, 0);

    const shippingPence = calculateShipping(subtotal);

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
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout`,
      metadata: {
        item_count: items.length.toString(),
        ...(customerId && { customer_id: customerId }),
        cart_data: JSON.stringify(items.map(i => ({
          v: i.variantId,
          q: i.quantity,
          s: i.isSubscription ? 1 : 0,
        }))).slice(0, 500), // Stripe metadata limit
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
