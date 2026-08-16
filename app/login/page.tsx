'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Shell } from '@/components/shell';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import { portalForRole, type UserRole } from '@/lib/portal';

const REQUEST_TIMEOUT_MS = 10000;

type TimeoutResult<T> = T;

function withTimeout<T>(promise: PromiseLike<T>, timeoutMs = REQUEST_TIMEOUT_MS): Promise<TimeoutResult<T>> {
  return new Promise<T>((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error('Permintaan ke Supabase terlalu lama. Periksa konfigurasi Supabase dan koneksi jaringan.')), timeoutMs);
    Promise.resolve(promise).then(
      value => { window.clearTimeout(timer); resolve(value); },
      error => { window.clearTimeout(timer); reject(error); },
    );
  });
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (loading) return;
    setError('');
    const client = getSupabaseBrowserClient();
    if (!client) { setError('Supabase belum dikonfigurasi di environment Vercel.'); return; }
    if (!email.trim() || !password) { setError('Email dan password wajib diisi.'); return; }
    setLoading(true);

    try {
      const authResult = await withTimeout(
        client.auth.signInWithPassword({ email: email.trim(), password }),
      );
      const { data, error: authError } = authResult;
      if (authError || !data.user) {
        setError(authError?.message || 'Login gagal. Periksa email dan password.');
        return;
      }

      const profileResult = await withTimeout(
        client.from('profiles').select('role, full_name').eq('id', data.user.id).maybeSingle(),
      );
      const { data: profile, error: profileError } = profileResult;
      if (profileError) {
        console.error('[CHEXO] profile lookup failed', profileError);
        setError(`Profil tidak dapat diverifikasi: ${profileError.message}`);
        return;
      }
      if (!profile?.role) {
        setError('Akun berhasil login, tetapi profil CHEXO belum memiliki role. Hubungi administrator.');
        return;
      }

      const role = profile.role as UserRole;
      const portal = portalForRole(role);
      if (portal === '/login') {
        setError('Role akun tidak dikenali oleh CHEXO. Hubungi administrator.');
        return;
      }

      window.location.assign(portal);
    } catch (caught) {
      console.error('[CHEXO] login error', caught);
      setError(caught instanceof Error ? caught.message : 'Terjadi kesalahan saat login.');
    } finally {
      setLoading(false);
    }
  };

  return <Shell><div className="container"><div className="login-wrap"><div className="login-card"><div className="eyebrow">CHEXO Account</div><h1 style={{fontSize:36,letterSpacing:'-.05em',margin:'0 0 8px'}}>Selamat datang.</h1><p className="muted">Masuk menggunakan akun CHEXO untuk membuka portal sesuai role-mu.</p><div className="form"><label>Email</label><input className="input" value={email} onChange={e=>setEmail(e.target.value)} placeholder="nama@sekolah.sch.id" autoComplete="email"/><label>Password</label><input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" onKeyDown={e=>{if(e.key==='Enter') void submit()}}/>{error && <div className="status status-red" role="alert">{error}</div>}<button className="button button-dark" onClick={() => void submit()} disabled={loading}>{loading ? 'Memverifikasi...' : 'Masuk ke portal →'}</button></div><p className="muted" style={{fontSize:10,marginTop:18}}>Role tidak dipilih secara manual. CHEXO membaca role dari profil Supabase dan mengarahkan akun ke portal yang sesuai.</p><Link href="/" style={{fontSize:11,textDecoration:'none',color:'var(--primary)',fontWeight:800}}>← Kembali ke website</Link></div></div></div></Shell>;
}
