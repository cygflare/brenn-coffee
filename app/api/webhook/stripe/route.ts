import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase/server';
import type Stripe from 'stripe';

// Stripe webhooks need raw body — Next 14 App Router handles this automatically with req.text()
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = createAdminClient();

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    try {
      // Fetch line items
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
        limit: 100,
        expand: ['data.price.product'],
      });

      // Parse cart metadata
      let cartData: { v: string; q: number; s: number }[] = [];
      try {
        cartData = JSON.parse(session.metadata?.cart_data ?? '[]');
      } catch {
        cartData = [];
      }

      // Get shipping address
      const ship = (session as any).shipping_details ?? session.shipping_cost?.shipping_rate;
      const shippingAddress = (session as any).shipping_details?.address ?? {};
      const shippingName = (session as any).shipping_details?.name ?? '';

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          email: session.customer_email ?? '',
          status: 'paid',
          subtotal_pence: (session.amount_subtotal ?? 0),
          shipping_pence: (session.shipping_cost?.amount_total ?? 0),
          total_pence: (session.amount_total ?? 0),
          currency: (session.currency ?? 'gbp').toUpperCase(),
          shipping_name: shippingName,
          shipping_line1: shippingAddress.line1 ?? null,
          shipping_line2: shippingAddress.line2 ?? null,
          shipping_city: shippingAddress.city ?? null,
          shipping_postcode: shippingAddress.postal_code ?? null,
          shipping_country: shippingAddress.country ?? 'GB',
          stripe_payment_intent_id: session.payment_intent as string,
          stripe_session_id: session.id,
          paid_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (orderError || !order) {
        console.error('Order creation failed:', orderError);
        return NextResponse.json({ error: 'Order creation failed' }, { status: 500 });
      }

      // Create order items - reconstruct from cart metadata for accurate variant linking
      if (cartData.length > 0) {
        const variantIds = cartData.map((c) => c.v);
        const { data: variants } = await supabase
          .from('product_variants')
          .select('id, product_id, size_g, grind, price_pence, products(name)')
          .in('id', variantIds);

        const variantMap = new Map(variants?.map((v) => [v.id, v]) ?? []);

        const orderItems = cartData
          .map((c) => {
            const variant = variantMap.get(c.v);
            if (!variant) return null;
            const product = Array.isArray(variant.products) ? variant.products[0] : variant.products;
            const isSub = c.s === 1;
            const unitPrice = isSub
              ? Math.round(variant.price_pence * 0.85)
              : variant.price_pence;
            return {
              order_id: order.id,
              product_id: variant.product_id,
              variant_id: variant.id,
              product_name: product.name + (isSub ? ' (Subscription)' : ''),
              variant_label: `${variant.size_g}g · ${variant.grind.replace('_', ' ')}`,
              quantity: c.q,
              unit_price_pence: unitPrice,
              line_total_pence: unitPrice * c.q,
            };
          })
          .filter(Boolean);

        if (orderItems.length > 0) {
          await supabase.from('order_items').insert(orderItems as any);
        }
      } else {
        // Fallback: use Stripe line items if cart metadata missing
        const orderItems = lineItems.data.map((item) => ({
          order_id: order.id,
          product_name: item.description ?? 'Coffee',
          quantity: item.quantity ?? 1,
          unit_price_pence: item.price?.unit_amount ?? 0,
          line_total_pence: item.amount_total,
        }));
        await supabase.from('order_items').insert(orderItems);
      }

      console.log(`✓ Order ${order.order_number} created for ${session.customer_email}`);

      // TODO: send confirmation email (Resend, etc.)
    } catch (err) {
      console.error('Order processing error:', err);
      return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
