import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
const protectedRoutes: Record<string, 'student' | 'teacher' | 'administrator'> = { '/siswa': 'student', '/guru': 'teacher', '/admin': 'administrator' };
function portal(role: string) { if (role === 'student') return '/siswa'; if (role === 'teacher') return '/guru'; if (role === 'administrator') return '/admin'; return '/login'; }
export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return response;
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { cookies: { getAll: () => request.cookies.getAll(), setAll: (cookiesToSet) => cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options)) } });
  const { data: { user } } = await supabase.auth.getUser(); const pathname = request.nextUrl.pathname; const matched = Object.keys(protectedRoutes).find((route) => pathname === route || pathname.startsWith(`${route}/`));
  if (!matched) { if (pathname === '/login' && user) { const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle(); if (profile?.role) return NextResponse.redirect(new URL(portal(profile.role), request.url)); } return response; }
  if (!user) return NextResponse.redirect(new URL('/login', request.url));
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle(); const expected = protectedRoutes[matched];
  if (!profile?.role) return NextResponse.redirect(new URL('/login', request.url)); if (profile.role !== expected) return NextResponse.redirect(new URL(portal(profile.role), request.url)); return response;
}
export const config = { matcher: ['/login', '/siswa/:path*', '/guru/:path*', '/admin/:path*'] };
