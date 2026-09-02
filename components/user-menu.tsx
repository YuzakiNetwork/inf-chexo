'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { portalForRole, roleLabel, type UserRole } from '@/lib/portal';

type UserProfile = {
  full_name: string | null;
  role: UserRole | null;
};

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase() || 'CH';
}

export function UserMenu() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [email, setEmail] = useState<string>('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      if (!supabase) {
        if (mounted) setLoading(false);
        return;
      }

      try {
        const { data: authData } = await supabase.auth.getUser();
        const user = authData.user;

        if (!user) {
          if (mounted) setLoading(false);
          return;
        }

        const { data } = await supabase
          .from('profiles')
          .select('full_name, role')
          .eq('id', user.id)
          .maybeSingle();

        if (mounted) {
          setEmail(user.email || '');
          setProfile({
            full_name: data?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            role: (data?.role as UserRole) || null,
          });
        }
      } catch (error) {
        console.error('[CHEXO] user menu error', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadProfile();

    if (!supabase) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadProfile();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const logout = async () => {
    if (supabase) await supabase.auth.signOut();
    setOpen(false);
    window.location.href = '/';
  };

  if (loading) {
    return <div style={{ width: 80, height: 36, background: 'var(--surface-2)', borderRadius: 'var(--radius)', opacity: 0.5 }} />;
  }

  // Not logged in - show Masuk button
  if (!profile) {
    return <Link href="/login" className="button button-primary">Masuk</Link>;
  }

  // Logged in - show profile dropdown
  const portal = profile.role ? portalForRole(profile.role) : '/login';
  const displayName = profile.full_name || 'User';

  return (
    <div ref={menuRef} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '4px 12px 4px 4px',
          border: '1px solid var(--line)',
          borderRadius: 999,
          background: 'var(--surface)',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
      >
        <span style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: 'var(--text)',
          color: 'white',
          display: 'grid',
          placeItems: 'center',
          fontSize: 11,
          fontWeight: 700,
        }}>
          {initials(displayName)}
        </span>
        <span style={{ fontSize: 13, fontWeight: 500 }}>{displayName.split(' ')[0]}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: 240,
            background: 'var(--surface)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
            padding: 8,
            zIndex: 100,
          }}
        >
          {/* User Info */}
          <div style={{ padding: '12px 12px 8px', borderBottom: '1px solid var(--line)', marginBottom: 8 }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{displayName}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{email}</div>
            {profile.role && (
              <span className="tag" style={{ marginTop: 8 }}>{roleLabel(profile.role)}</span>
            )}
          </div>

          {/* Menu Items */}
          <Link
            href={portal}
            onClick={() => setOpen(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: 14,
              color: 'var(--text)',
              textDecoration: 'none',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-2)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Portal {profile.role ? roleLabel(profile.role) : ''}
          </Link>

          <Link
            href="/"
            onClick={() => setOpen(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: 14,
              color: 'var(--text)',
              textDecoration: 'none',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-2)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            Beranda
          </Link>

          <button
            type="button"
            onClick={logout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: 14,
              color: 'var(--danger)',
              background: 'transparent',
              border: 0,
              cursor: 'pointer',
              width: '100%',
              textAlign: 'left',
              marginTop: 4,
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Keluar
          </button>
        </div>
      )}
    </div>
  );
}
