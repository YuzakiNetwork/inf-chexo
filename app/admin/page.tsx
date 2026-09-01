'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Shell } from '@/components/shell';
import { RoleGuard } from '@/components/role-guard';
import { getSupabaseBrowserClient } from '@/lib/supabase';

type Stats = {
  users: number;
  students: number;
  teachers: number;
  materials: number;
  assignments: number;
  submissions: number;
  karya: number;
};

export default function Admin() {
  const [stats, setStats] = useState<Stats>({
    users: 0, students: 0, teachers: 0,
    materials: 0, assignments: 0, submissions: 0, karya: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const sb = getSupabaseBrowserClient();
      if (!sb) return;
      const tables = ['profiles', 'materials', 'assignments', 'submissions', 'karya'] as const;
      const results = await Promise.all(
        tables.map((t) => sb.from(t).select('*', { count: 'exact', head: true }))
      );
      const { count: students } = await sb.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'siswa');
      const { count: teachers } = await sb.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'guru');

      setStats({
        users: results[0].count || 0,
        students: students || 0,
        teachers: teachers || 0,
        materials: results[1].count || 0,
        assignments: results[2].count || 0,
        submissions: results[3].count || 0,
        karya: results[4].count || 0,
      });
      setLoading(false);
    })();
  }, []);

  return (
    <RoleGuard role="administrator">
      <Shell>
        <div className="container">
          <div className="page-head">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <span className="tag" style={{ marginBottom: 12 }}>Administration</span>
                <h1>Kontrol CHEXO</h1>
                <p>Administrasi data pengguna, materi, dan tugas dari Supabase.</p>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <Link href="/admin/users" className="button button-primary">Kelola Pengguna</Link>
                <Link href="/guru/materi" className="button">Materi</Link>
                <Link href="/guru/tugas" className="button">Tugas</Link>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="stats" style={{ marginBottom: 32 }}>
            <div className="stat">
              <span className="stat-value">{loading ? '—' : stats.users}</span>
              <span className="stat-label">Total Pengguna</span>
            </div>
            <div className="stat">
              <span className="stat-value">{loading ? '—' : stats.students}</span>
              <span className="stat-label">Siswa</span>
            </div>
            <div className="stat">
              <span className="stat-value">{loading ? '—' : stats.teachers}</span>
              <span className="stat-label">Guru</span>
            </div>
            <div className="stat">
              <span className="stat-value">{loading ? '—' : stats.materials}</span>
              <span className="stat-label">Materi</span>
            </div>
            <div className="stat">
              <span className="stat-value">{loading ? '—' : stats.assignments}</span>
              <span className="stat-label">Tugas</span>
            </div>
            <div className="stat">
              <span className="stat-value">{loading ? '—' : stats.submissions}</span>
              <span className="stat-label">Submission</span>
            </div>
            <div className="stat">
              <span className="stat-value">{loading ? '—' : stats.karya}</span>
              <span className="stat-label">Karya</span>
            </div>
            <div className="stat">
              <span className="stat-value">∞</span>
              <span className="stat-label">Potensi</span>
            </div>
          </div>

          {/* Quick Actions */}
          <section className="section" style={{ paddingTop: 0 }}>
            <div className="section-head">
              <div>
                <h2 className="section-title">Aksi Cepat</h2>
                <p className="section-subtitle">Kelola semua aspek CHEXO dari sini.</p>
              </div>
            </div>
            <div className="grid grid-3">
              <Link href="/admin/users" className="card" style={{ textDecoration: 'none' }}>
                <h3 className="card-title">Kelola Pengguna</h3>
                <p className="card-desc">Tambah, edit, atau hapus akun siswa dan guru.</p>
              </Link>
              <Link href="/guru/materi" className="card" style={{ textDecoration: 'none' }}>
                <h3 className="card-title">Kelola Materi</h3>
                <p className="card-desc">Buat dan publikasikan materi pembelajaran.</p>
              </Link>
              <Link href="/guru/tugas" className="card" style={{ textDecoration: 'none' }}>
                <h3 className="card-title">Kelola Tugas</h3>
                <p className="card-desc">Buat tugas dan nilai submission siswa.</p>
              </Link>
            </div>
          </section>
        </div>
      </Shell>
    </RoleGuard>
  );
}
