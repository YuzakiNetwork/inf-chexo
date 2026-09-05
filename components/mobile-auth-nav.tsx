'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { portalForRole, type UserRole } from '@/lib/portal';

export function MobileAuthNav() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [portal, setPortal] = useState('/login');

  useEffect(() => {
    let mounted = true;
    if (!supabase) return;

    const load = async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (!user) {
        if (mounted) setLoggedIn(false);
        return;
      }
      const { data: prof } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();
      if (mounted) {
        setLoggedIn(true);
        setPortal(portalForRole((prof?.role as UserRole) || null));
      }
    };

    load();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => load());
    return () => { mounted = false; subscription.unsubscribe(); };
  }, []);

  return loggedIn
    ? <Link href={portal}><span className="icon">person</span>Profil</Link>
    : <Link href="/login"><span className="icon">login</span>Masuk</Link>;
}
