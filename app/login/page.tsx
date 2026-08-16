'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shell } from '@/components/shell';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import { portalForRole, roleLabel, type UserRole } from '@/lib/portal';

export default function Login(){
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [error,setError]=useState('');
  const [loading,setLoading]=useState(false);
  const router=useRouter();

  const submit = async () => {
    setError('');
    const client = getSupabaseBrowserClient();
    if (!client) { setError('Supabase belum dikonfigurasi. Hubungkan .env.local terlebih dahulu.'); return; }
    if (!email || !password) { setError('Email dan password wajib diisi.'); return; }
    setLoading(true);
    const { data, error: signInError } = await client.auth.signInWithPassword({ email, password });
    if (signInError || !data.user) { setError(signInError?.message || 'Login gagal.'); setLoading(false); return; }
    const { data: profile, error: profileError } = await client.from('profiles').select('role, full_name').eq('id', data.user.id).maybeSingle();
    if (profileError || !profile?.role) { await client.auth.signOut(); setError('Akun berhasil login, tetapi profil CHEXO belum memiliki role.'); setLoading(false); return; }
    router.replace(portalForRole(profile.role as UserRole));
  };

  return <Shell><div className="container"><div className="login-wrap"><div className="login-card"><div className="eyebrow">CHEXO Account</div><h1 style={{fontSize:36,letterSpacing:'-.05em',margin:'0 0 8px'}}>Selamat datang.</h1><p className="muted">Masuk menggunakan akun CHEXO untuk membuka portal sesuai role-mu.</p><div className="form"><label>Email</label><input className="input" value={email} onChange={e=>setEmail(e.target.value)} placeholder="nama@sekolah.sch.id" autoComplete="email"/><label>Password</label><input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" onKeyDown={e=>{if(e.key==='Enter') submit()}}/>{error && <div className="status status-red">{error}</div>}<button className="button button-dark" onClick={submit} disabled={loading}>{loading ? 'Memverifikasi...' : 'Masuk ke portal →'}</button></div><p className="muted" style={{fontSize:10,marginTop:18}}>Role tidak dipilih secara manual. CHEXO membaca role dari profil Supabase dan mengarahkan akun ke portal yang sesuai.</p><Link href="/" style={{fontSize:11,textDecoration:'none',color:'var(--primary)',fontWeight:800}}>← Kembali ke website</Link></div></div></div></Shell>}
