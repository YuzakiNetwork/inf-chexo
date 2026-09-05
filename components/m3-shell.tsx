'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';

export function M3Shell({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Font preload
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const link = document.createElement('link');
      link.href = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    const sb = getSupabaseBrowserClient();
    if (!sb) return;
    sb.auth.getUser().then(({ data }) => setUser(data.user));
    const sub = sb.auth.onAuthStateChange((_, session) => setUser(session?.user ?? null));
    return () => sub.data.subscription.unsubscribe();
  }, []);

  const logout = async () => {
    const sb = getSupabaseBrowserClient();
    if (sb) await sb.auth.signOut();
    router.push('/login');
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <header className="m3-header">
        <div className="m3-header-inner">
          <Link href="/" className="m3-brand">
            <span style={{ fontSize: 28 }}>📚</span>
            CHEXO
          </Link>
          <nav className="m3-nav">
            <Link href="/materi">Materi</Link>
            <Link href="/tugas">Tugas</Link>
            <Link href="/karya">Karya</Link>
            {user ? (
              <button onClick={logout} className="m3-btn m3-btn-outlined">
                Logout
              </button>
            ) : (
              <Link href="/login" className="m3-btn m3-btn-primary">
                Login
              </Link>
            )}
          </nav>
        </div>
      </header>
      <main className="container">
        {children}
      </main>
      <footer className="m3-footer">
        © 2025 CHEXO • SMAN 1 Cicalengka
      </footer>
    </div>
  );
}
