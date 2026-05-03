'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/+$/, '');

export type AuthResult = { error?: string; success?: string };

export async function signInAction(_prev: AuthResult, formData: FormData): Promise<AuthResult> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  const next = String(formData.get('next') ?? '/account');

  if (!email || !password) return { error: 'Email and password are required.' };

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return { error: friendlyAuthError(error.message) };

  revalidatePath('/', 'layout');
  redirect(next);
}

export async function signUpAction(_prev: AuthResult, formData: FormData): Promise<AuthResult> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  const firstName = String(formData.get('first_name') ?? '').trim();

  if (!email || !password) return { error: 'Email and password are required.' };
  if (password.length < 8) return { error: 'Password must be at least 8 characters.' };

  const supabase = createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${SITE_URL}/auth/callback?next=/account`,
      data: { first_name: firstName },
    },
  });

  if (error) return { error: friendlyAuthError(error.message) };

  return { success: 'Check your inbox for a confirmation link.' };
}

export async function forgotPasswordAction(_prev: AuthResult, formData: FormData): Promise<AuthResult> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  if (!email) return { error: 'Email is required.' };

  const supabase = createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${SITE_URL}/auth/callback?next=/reset-password`,
  });

  if (error) return { error: friendlyAuthError(error.message) };
  return { success: 'If an account exists, a reset link has been sent.' };
}

export async function resetPasswordAction(_prev: AuthResult, formData: FormData): Promise<AuthResult> {
  const password = String(formData.get('password') ?? '');
  if (password.length < 8) return { error: 'Password must be at least 8 characters.' };

  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) return { error: friendlyAuthError(error.message) };

  revalidatePath('/', 'layout');
  redirect('/account');
}

function friendlyAuthError(msg: string): string {
  if (msg.toLowerCase().includes('invalid login')) return 'Wrong email or password.';
  if (msg.toLowerCase().includes('email not confirmed'))
    return 'Please confirm your email address — check your inbox.';
  if (msg.toLowerCase().includes('user already registered'))
    return 'An account with that email already exists. Sign in instead.';
  return msg;
}
