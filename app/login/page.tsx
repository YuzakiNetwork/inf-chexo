'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Shell } from '@/components/shell';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import { portalForRole, type UserRole } from '@/lib/portal';

const REQUEST_TIMEOUT_MS = 10000;

type SupabaseResult<T> = { data: T; error: { message: string } | null };

function withTimeout<T>(promise: PromiseLike<T>, timeoutMs = REQUEST_TIMEOUT_MS): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = window.setTimeout(
      () => reject(new Error('Permintaan ke Supabase terlalu lama. Periksa koneksi jaringan.')),
      timeoutMs
    );
    Promise.resolve(promise).then(
      (value) => { window.clearTimeout(timer); resolve(value); },
      (error) => { window.clearTimeout(timer); reject(error); }
    );
  });
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Check if user is already logged in - auto redirect to portal
  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      const client = getSupabaseBrowserClient();
      if (!client) {
        if (mounted) setCheckingAuth(false);
        return;
      }

      try {
        const { data: authData } = await withTimeout(client.auth.getUser());
        const user = authData?.user;

        if (!user) {
          if (mounted) setCheckingAuth(false);
          return;
        }

        const profileResult = await withTimeout(
          client.from('profiles').select('role').eq('id', user.id).maybeSingle()
        ) as SupabaseResult<{ role: string | null } | null>;

        const role = profileResult.data?.role as UserRole | null;
        if (role) {
          const portal = portalForRole(role);
          if (portal !== '/login') {
            window.location.replace(portal);
            return;
          }
        }
      } catch (err) {
        console.error('[CHEXO] auth check error', err);
      } finally {
        if (mounted) setCheckingAuth(false);
      }
    };

    checkSession();

    return () => { mounted = false; };
  }, []);

  const submit = async () => {
    if (loading) return;
    setError('');
    const client = getSupabaseBrowserClient();
    if (!client) {
      setError('Supabase belum dikonfigurasi.');
      return;
    }
    if (!email.trim() || !password) {
      setError('Email dan password wajib diisi.');
      return;
    }
    setLoading(true);
    try {
      const authResult = await withTimeout(
        client.auth.signInWithPassword({ email: email.trim(), password })
      ) as SupabaseResult<{ user: { id: string } | null }>;
      const { data, error: authError } = authResult;
      if (authError || !data.user) {
        setError(authError?.message || 'Login gagal. Periksa email dan password.');
        return;
      }

      const profileResult = await withTimeout(
        client.from('profiles').select('role, full_name').eq('id', data.user.id).maybeSingle()
      ) as SupabaseResult<{ role: string | null; full_name: string | null } | null>;
      const { data: profile, error: profileError } = profileResult;
      if (profileError) {
        setError(`Profil tidak dapat diverifikasi: ${profileError.message}`);
        return;
      }
      if (!profile?.role) {
        setError('Akun berhasil login, tetapi profil belum memiliki role. Hubungi administrator.');
        return;
      }

      const role = profile.role as UserRole;
      const portal = portalForRole(role);
      if (portal === '/login') {
        setError('Role akun tidak dikenali.');
        return;
      }
      window.location.assign(portal);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Terjadi kesalahan saat login.');
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking existing session
  if (checkingAuth) {
    return (
      <Shell>
        <div className="container">
          <div className="login-wrap">
            <div className="login-card" style={{ textAlign: 'center' }}>
              <p style={{ color: 'var(--text-secondary)' }}>Memeriksa sesi...</p>
            </div>
          </div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="container">
        <div className="login-wrap">
          <div className="login-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <Image
                src="/chexo.webp"
                alt="Logo SMAN 1 Cicalengka"
                width={40}
                height={40}
                style={{ borderRadius: 8 }}
              />
              <div>
                <strong style={{ fontSize: 16, fontWeight: 700 }}>CHEXO</strong>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>SMAN 1 Cicalengka</div>
              </div>
            </div>

            <h1>Masuk ke Portal</h1>
            <p>Gunakan akun CHEXO untuk membuka portal sesuai role-mu.</p>

            <div className="form">
              <div>
                <label>Email</label>
                <input
                  className="input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@sekolah.sch.id"
                  autoComplete="email"
                  autoFocus
                />
              </div>
              <div>
                <label>Password</label>
                <input
                  className="input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  onKeyDown={(e) => { if (e.key === 'Enter') void submit(); }}
                />
              </div>

              {error && (
                <div className="status status-danger" role="alert">
                  {error}
                </div>
              )}

              <button
                className="button button-primary"
                onClick={() => void submit()}
                disabled={loading}
                style={{ width: '100%', padding: '12px 16px' }}
              >
                {loading ? 'Memverifikasi...' : 'Masuk'}
              </button>
            </div>

            <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--line)', fontSize: 13, color: 'var(--text-secondary)' }}>
              Role ditentukan oleh administrator, bukan dipilih sendiri.
              <br />
              <Link href="/" style={{ color: 'var(--text)', fontWeight: 500, marginTop: 8, display: 'inline-block' }}>
                ← Kembali ke beranda
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}
