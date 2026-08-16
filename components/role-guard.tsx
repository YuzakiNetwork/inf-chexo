'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { portalForRole, type UserRole } from '@/lib/portal';

const GUARD_TIMEOUT_MS = 10000;
export function RoleGuard({ role, children }: { role: UserRole | UserRole[]; children: React.ReactNode }) {
  const router=useRouter(); const [state,setState]=useState<'checking'|'allowed'|'error'>('checking'); const [message,setMessage]=useState('CHEXO sedang memeriksa akses portal.');
  useEffect(()=>{let active=true;const timer=window.setTimeout(()=>{if(active){setState('error');setMessage('Verifikasi akun terlalu lama. Silakan kembali ke login dan coba lagi.')}},GUARD_TIMEOUT_MS);(async()=>{try{if(!supabase){router.replace('/login');return}const {data:{user},error:authError}=await supabase.auth.getUser();if(authError||!user){router.replace('/login');return}const {data:profile,error:profileError}=await supabase.from('profiles').select('role').eq('id',user.id).maybeSingle();if(profileError||!profile?.role){await supabase.auth.signOut();router.replace('/login');return}const userRole=profile.role as UserRole;const allowed=Array.isArray(role)?role.includes(userRole):userRole===role;if(!allowed){router.replace(portalForRole(userRole));return}if(active)setState('allowed')}catch(error){console.error('[CHEXO] role guard error',error);if(active){setState('error');setMessage(error instanceof Error?error.message:'Verifikasi akses gagal.')}}finally{window.clearTimeout(timer)}})();return()=>{active=false;window.clearTimeout(timer)}},[role,router]);
  if(state==='error')return <div className="container" style={{minHeight:'60vh',display:'grid',placeItems:'center'}}><div className="card"><strong>Gagal memverifikasi akun</strong><p className="muted">{message}</p><button className="button button-dark" type="button" onClick={()=>window.location.assign('/login')}>Kembali ke login</button></div></div>;
  if(state!=='allowed')return <div className="container" style={{minHeight:'60vh',display:'grid',placeItems:'center'}}><div className="card"><strong>Memverifikasi akun...</strong><p className="muted">CHEXO sedang memeriksa akses portal.</p></div></div>;
  return <>{children}</>;
}
