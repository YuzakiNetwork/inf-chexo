'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shell } from '@/components/shell';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import { portalForRole, type UserRole } from '@/lib/portal';

const PROFILE_TIMEOUT_MS = 10000;

function withTimeout<T>(promise: PromiseLike<T>, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error('Permintaan ke server terlalu lama. Periksa koneksi internet dan konfigurasi Supabase.')), timeoutMs);
    Promise.resolve(promise).then(
      (value) => { window.clearTimeout(timer); resolve(value); },
      (error) => { window.clearTimeout(timer); reject(error); },
    );
  });
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const submit = async () => {
    if (loading) return;
    setError('');

    const client = getSupabaseBrowserClient();
    if (!client) {
      setError('Supabase belum dikonfigurasi. Periksa NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY di environment Vercel.');
      return;
    }
    if (!email.trim() || !password) {
      setError('Email dan password wajib diisi.');
      return;
    }

    setLoading(true);

    try {
      const { data, error: signInError } = await withTimeout(
        client.auth.signInWithPassword({ email: email.trim(), password }),
        PROFILE_TIMEOUT_MS,
      );

      if (signInError || !data.user) {
        setError(signInError?.message || 'Login gagal. Periksa email dan password.');
        return;
      }

      const { data: profile, error: profileError } = await withTimeout(
        client
          .from('profiles')
          .select('role, full_name')
          .eq('id', data.user.id)
          .maybeSingle(),
        PROFILE_TIMEOUT_MS,
      );

      if (profileError) {
        console.error('[CHEXO] profile lookup failed', profileError);
        await client.auth.signOut();
        setError(`Login berhasil, tetapi profil tidak dapat diverifikasi: ${profileError.message}`);
        return;
      }

      if (!profile?.role) {
        await client.auth.signOut();
        setError('Akun berhasil login, tetapi profil CHEXO belum memiliki role. Hubungi administrator.');
        return;
      }

      const role = profile.role as UserRole;
      const portal = portalForRole(role);

      if (portal === '/login') {
        await client.auth.signOut();
        setError('Role akun tidak dikenali oleh CHEXO. Hubungi administrator.');
        return;
      }

      router.replace(portal);
      router.refresh();
    } catch (caught) {
      console.error('[CHEXO] login error', caught);
      const message = caught instanceof Error ? caught.message : 'Terjadi kesalahan saat memverifikasi akun.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return <Shell><div className="container"><div className="login-wrap"><div className="login-card"><div className="eyebrow">CHEXO Account</div><h1 style={{fontSize:36,letterSpacing:'-.05em',margin:'0 0 8px'}}>Selamat datang.</h1><p className="muted">Masuk menggunakan akun CHEXO untuk membuka portal sesuai role-mu.</p><div className="form"><label>Email</label><input className="input" value={email} onChange={e=>setEmail(e.target.value)} placeholder="nama@sekolah.sch.id" autoComplete="email"/><label>Password</label><input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" onKeyDown={e=>{if(e.key==='Enter') void submit()}}/>{error && <div className="status status-red" role="alert">{error}</div>}<button className="button button-dark" onClick={() => void submit()} disabled={loading}>{loading ? 'Memverifikasi...' : 'Masuk ke portal →'}</button></div><p className="muted" style={{fontSize:10,marginTop:18}}>Role tidak dipilih secara manual. CHEXO membaca role dari profil Supabase dan mengarahkan akun ke portal yang sesuai.</p><Link href="/" style={{fontSize:11,textDecoration:'none',color:'var(--primary)',fontWeight:800}}>← Kembali ke website</Link></div></div></div></Shell>;
}
