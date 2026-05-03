import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('id');
  if (!sessionId) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const supabase = createAdminClient();
  const { data } = await supabase
    .from('orders')
    .select('order_number, total_pence, email')
    .eq('stripe_session_id', sessionId)
    .single();

  return NextResponse.json(data ?? {});
}
