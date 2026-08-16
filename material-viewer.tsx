'use client';

import { useEffect, useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase';

const LOCAL_PREFIX = 'chexo-material-progress:';

export function MaterialViewer({ materialId }: { materialId: string }) {
  const [progress, setProgress] = useState(0);
  const [saving, setSaving] = useState(true);
  const [signedIn, setSignedIn] = useState(false);
  const [message, setMessage] = useState('');
  const client = getSupabaseBrowserClient();

  useEffect(() => {
    let active = true;
    const load = async () => {
      const local = Number(window.localStorage.getItem(`${LOCAL_PREFIX}${materialId}`) ?? 0);
      if (!client) {
        if (active) { setProgress(local); setSaving(false); }
        return;
      }

      const { data: { user } } = await client.auth.getUser();
      if (!user) {
        if (active) { setSignedIn(false); setProgress(local); setSaving(false); }
        return;
      }
      setSignedIn(true);
      const { data } = await client.from('learning_progress')
        .select('progress')
        .eq('student_id', user.id)
        .eq('material_id', materialId)
        .maybeSingle();

      // The route uses a stable slug, while the DB stores UUIDs. Resolve it once.
      if (!data) {
        const { data: material } = await client.from('materials').select('id').eq('slug', materialId).maybeSingle();
        if (material) {
          const { data: row } = await client.from('learning_progress').select('progress').eq('student_id', user.id).eq('material_id', material.id).maybeSingle();
          if (active) setProgress(row?.progress ?? local);
        } else if (active) setProgress(local);
      } else if (active) setProgress(data.progress ?? 0);
      if (active) setSaving(false);
    };
    load();
    return () => { active = false; };
  }, [client, materialId]);

  const toggle = async () => {
    const next = progress === 100 ? 0 : 100;
    setProgress(next);
    window.localStorage.setItem(`${LOCAL_PREFIX}${materialId}`, String(next));
    setMessage('');

    if (!client || !signedIn) {
      setMessage('Progress tersimpan di perangkat. Login untuk sinkronisasi ke Supabase.');
      return;
    }

    setSaving(true);
    const { data: { user } } = await client.auth.getUser();
    const { data: material } = await client.from('materials').select('id').eq('slug', materialId).maybeSingle();
    if (!user || !material) {
      setSaving(false);
      setMessage('Progress lokal tetap tersimpan. Materi belum ditemukan di Supabase.');
      return;
    }

    const { error } = await client.from('learning_progress').upsert({
      student_id: user.id,
      material_id: material.id,
      progress: next,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'student_id,material_id' });

    setSaving(false);
    setMessage(error ? 'Gagal sinkronisasi. Progress lokal tetap aman.' : 'Progress tersimpan ke Supabase.');
  };

  return <div className="material-progress card">
    <div className="sidebar-title">Progress belajar</div>
    <div className="progress-big"><span style={{ '--progress': `${progress * 3.6}deg` } as React.CSSProperties}><b>{progress}%</b></span><div><strong>{progress === 100 ? 'Materi selesai' : 'Sedang dipelajari'}</strong><small>{signedIn ? 'Progress disinkronkan ke akun CHEXO.' : 'Login agar progress tersimpan di akun.'}</small></div></div>
    <button type="button" className="button button-primary full" onClick={toggle} disabled={saving}>{saving ? 'Menyimpan...' : progress === 100 ? 'Tandai belum selesai' : 'Tandai sudah selesai'}</button>
    {message && <small className="muted" style={{display:'block', marginTop:10}}>{message}</small>}
  </div>;
}
