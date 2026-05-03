import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/+$/, '');

export async function POST() {
  const supabase = createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(`${SITE_URL}/`, { status: 303 });
}
