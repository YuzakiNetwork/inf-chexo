'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { portalForRole, type UserRole } from '@/lib/portal';
export function RoleGuard({ role, children }: { role: UserRole; children: React.ReactNode }) {
  const router = useRouter(); const [allowed, setAllowed] = useState(false);
  useEffect(() => { let active = true; (async () => { if (!supabase) { router.replace('/login'); return; } const { data: { user } } = await supabase.auth.getUser(); if (!user) { router.replace('/login'); return; } const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle(); if (!profile?.role) { await supabase.auth.signOut(); router.replace('/login'); return; } if (profile.role !== role) { router.replace(portalForRole(profile.role as UserRole)); return; } if (active) setAllowed(true); })(); return () => { active = false; }; }, [role, router]);
  if (!allowed) return <div className="container" style={{ minHeight: '60vh', display: 'grid', placeItems: 'center' }}><div className="card"><strong>Memverifikasi akun...</strong><p className="muted">CHEXO sedang memeriksa akses portal.</p></div></div>;
  return <>{children}</>;
}
