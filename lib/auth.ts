import { redirect } from 'next/navigation';
import { createClient, createAdminClient } from '@/lib/supabase/server';

export type AuthUser = {
  id: string;
  email: string;
  role: 'customer' | 'admin';
  first_name: string | null;
  last_name: string | null;
};

/**
 * Get the current authenticated user along with their customer profile.
 * Returns null if not signed in.
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: customer } = await supabase
    .from('customers')
    .select('email, role, first_name, last_name')
    .eq('id', user.id)
    .single();

  if (!customer) {
    return {
      id: user.id,
      email: user.email ?? '',
      role: 'customer',
      first_name: null,
      last_name: null,
    };
  }

  return {
    id: user.id,
    email: customer.email,
    role: (customer.role as 'customer' | 'admin') ?? 'customer',
    first_name: customer.first_name,
    last_name: customer.last_name,
  };
}

/**
 * Require an authenticated user. Redirects to /sign-in if not.
 */
export async function requireAuth(redirectTo?: string): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) {
    const next = redirectTo ? `?next=${encodeURIComponent(redirectTo)}` : '';
    redirect(`/sign-in${next}`);
  }
  return user;
}

/**
 * Require an admin user. Redirects to /sign-in if not authed, or / if not admin.
 */
export async function requireAdmin(redirectTo?: string): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) {
    const next = redirectTo ? `?next=${encodeURIComponent(redirectTo)}` : '';
    redirect(`/sign-in${next}`);
  }
  if (user.role !== 'admin') {
    redirect('/?unauthorized=1');
  }
  return user;
}

/**
 * Service-role Supabase client for admin operations (bypasses RLS).
 * Use only in server code that has already verified the caller is an admin.
 */
export function adminDb() {
  return createAdminClient();
}
