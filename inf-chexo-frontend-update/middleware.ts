import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

type UserRole = 'siswa' | 'guru' | 'administrator';

const protectedRoutes: Record<string, UserRole> = {
  '/siswa': 'siswa',
  '/guru': 'guru',
  '/admin': 'administrator',
};

function portalForRole(role: string | null | undefined) {
  if (role === 'siswa') return '/siswa';
  if (role === 'guru') return '/guru';
  if (role === 'administrator') return '/admin';
  return '/login';
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const matched = Object.keys(protectedRoutes).find(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  // Login is intentionally never redirected by middleware. The login page owns
  // the post-auth redirect, while protected portals are enforced here.
  if (!matched) return NextResponse.next();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return NextResponse.redirect(new URL('/login?error=supabase_config', request.url));
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError || !profile?.role) {
    return NextResponse.redirect(new URL('/login?error=profile', request.url));
  }

  const expectedRole = protectedRoutes[matched];
  const actualPortal = portalForRole(profile.role);

  if (profile.role !== expectedRole) {
    return NextResponse.redirect(new URL(actualPortal, request.url));
  }

  return response;
}

export const config = {
  matcher: ['/siswa/:path*', '/guru/:path*', '/admin/:path*'],
};
