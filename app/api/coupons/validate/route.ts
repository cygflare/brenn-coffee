import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, createClient } from '@/lib/supabase/server';
import { validateCouponForCart } from '@/lib/coupons';
import type { CartItem } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { code, items, email } = (await req.json()) as {
      code: string;
      items: CartItem[];
      email?: string;
    };

    if (!code || !items?.length) {
      return NextResponse.json(
        { ok: false, error: 'Missing code or cart.' },
        { status: 400 }
      );
    }

    // Re-fetch live variant prices so client-supplied prices can't inflate the discount
    const admin = createAdminClient();
    const variantIds = Array.from(new Set(items.map((i) => i.variantId)));
    const { data: variants } = await admin
      .from('product_variants')
      .select('id, price_pence, product_id')
      .in('id', variantIds);

    const variantMap = new Map(variants?.map((v) => [v.id, v]) ?? []);

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

    if (!sanitizedItems.length) {
      return NextResponse.json(
        { ok: false, error: 'Cart items could not be verified.' },
        { status: 400 }
      );
    }

    const userClient = createClient();
    const { data: { user } } = await userClient.auth.getUser();

    const result = await validateCouponForCart(admin, {
      code,
      items: sanitizedItems,
      email: email ?? user?.email ?? null,
      customerId: user?.id ?? null,
    });

    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 200 });
    }

    return NextResponse.json({
      ok: true,
      applied: result.applied,
    });
  } catch (err: any) {
    console.error('Coupon validate error:', err);
    return NextResponse.json(
      { ok: false, error: err.message || 'Could not validate coupon.' },
      { status: 500 }
    );
  }
}
