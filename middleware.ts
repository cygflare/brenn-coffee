import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

type CookieToSet = { name: string; value: string; options: CookieOptions };

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set({ name, value, ...options });
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = req.nextUrl.pathname;

  // Routes requiring auth (and possibly admin role)
  const isAdminRoute = pathname.startsWith('/admin');
  const isAccountRoute = pathname.startsWith('/account');

  if ((isAdminRoute || isAccountRoute) && !user) {
    const url = req.nextUrl.clone();
    url.pathname = '/sign-in';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  if (isAdminRoute && user) {
    const { data: customer } = await supabase
      .from('customers')
      .select('role')
      .eq('id', user.id)
      .single();

    if (customer?.role !== 'admin') {
      const url = req.nextUrl.clone();
      url.pathname = '/';
      url.searchParams.set('unauthorized', '1');
      return NextResponse.redirect(url);
    }
  }

  // Redirect authed users away from auth pages
  const isAuthPage = ['/sign-in', '/sign-up', '/forgot-password'].some((p) =>
    pathname.startsWith(p)
  );
  if (isAuthPage && user) {
    const url = req.nextUrl.clone();
    url.pathname = '/account';
    return NextResponse.redirect(url);
  }

  return res;
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/account/:path*',
    '/sign-in',
    '/sign-up',
    '/forgot-password',
  ],
};
