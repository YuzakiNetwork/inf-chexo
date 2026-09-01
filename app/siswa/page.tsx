'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { RoleGuard } from '@/components/role-guard';
import { Shell } from '@/components/shell';
import { BackButton } from '@/components/back-button';
import { supabase } from '@/lib/supabase';

type DashboardMaterial = {
  id: string;
  slug: string | null;
  title: string;
  progress: number;
};

type StudentProfile = {
  full_name: string | null;
  role: 'siswa' | 'guru' | null;
  class_id: string | null;
  className?: string | null;
};

type ClassRelation = { name?: string | null } | Array<{ name?: string | null }> | null | undefined;

type MaterialRow = { id: string; slug: string | null; title: string };
type ProgressRow = { material_id: string; progress: number | null };

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'CH';
}

export default function SiswaDashboard() {
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [materials, setMaterials] = useState<DashboardMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataError, setDataError] = useState('');

  useEffect(() => {
    let mounted = true;

    (async () => {
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

        const [{ data: profile }, { data: materialRows, error: materialError }] = await Promise.all([
          supabase.from('profiles').select('full_name, role, class_id, classes(name)').eq('id', user.id).maybeSingle(),
          supabase.from('materials').select('id, slug, title').eq('published', true).order('created_at', { ascending: true }),
        ]);

        if (materialError) throw materialError;

        const typedMaterials = (materialRows || []) as MaterialRow[];
        const materialIds = typedMaterials.map((item: MaterialRow) => item.id);
        const { data: progressRows, error: progressError } = materialIds.length
          ? await supabase.from('learning_progress').select('material_id, progress').eq('student_id', user.id).in('material_id', materialIds)
          : { data: [], error: null };

        if (progressError) throw progressError;

        const typedProgress = (progressRows || []) as ProgressRow[];
        const progressMap = new Map(typedProgress.map((row: ProgressRow) => [row.material_id, row.progress ?? 0]));
        const classRelation = profile?.classes as unknown as ClassRelation;
        const classValue = Array.isArray(classRelation) ? classRelation[0]?.name : classRelation?.name;

        if (mounted) {
          setStudent({
            full_name: profile?.full_name || user.user_metadata?.full_name || user.email || null,
            role: profile?.role || null,
            class_id: profile?.class_id || null,
            className: classValue || null,
          });
          setMaterials(typedMaterials.map((item: MaterialRow) => ({
            id: item.id,
            slug: item.slug,
            title: item.title,
            progress: progressMap.get(item.id) ?? 0,
          })));
        }
      } catch (error) {
        console.error('[CHEXO] dashboard data error', error);
        if (mounted) setDataError('Data Supabase belum dapat dimuat.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, []);

  const displayName = student?.full_name || 'Siswa';
  const className = student?.className || '—';

  const completed = materials.filter((item) => item.progress >= 100).length;
  const overallProgress = materials.length
    ? Math.round(materials.reduce((sum, item) => sum + item.progress, 0) / materials.length)
    : 0;

  const nextMaterials = useMemo(
    () => materials.filter((item) => item.progress < 100).slice(0, 3),
    [materials],
  );

  const logout = async () => {
    if (supabase) await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <RoleGuard role="siswa">
      <Shell>
        <div className="container">
          <div className="page-head">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <span className="tag" style={{ marginBottom: 12 }}>Portal Siswa</span>
                <h1>Selamat datang, {displayName.split(' ')[0]}</h1>
                <p>Kelas {className} · Pantau pembelajaran Informatika, materi, dan tugasmu.</p>
              </div>
              <button className="button" type="button" onClick={logout}>
                Keluar
              </button>
            </div>
          </div>

          {dataError && (
            <div className="card" style={{ marginBottom: 24, padding: 16, background: '#fef2f2', borderColor: '#fecaca' }}>
              <strong style={{ fontSize: 14, color: 'var(--danger)' }}>{dataError}</strong>
            </div>
          )}

          {/* Stats */}
          <div className="stats" style={{ marginBottom: 32 }}>
            <div className="stat">
              <span className="stat-value">{loading ? '—' : materials.length}</span>
              <span className="stat-label">Total Materi</span>
            </div>
            <div className="stat">
              <span className="stat-value">{loading ? '—' : completed}</span>
              <span className="stat-label">Materi Selesai</span>
            </div>
            <div className="stat">
              <span className="stat-value">{loading ? '—' : `${overallProgress}%`}</span>
              <span className="stat-label">Progress Belajar</span>
            </div>
            <div className="stat">
              <span className="stat-value">{className}</span>
              <span className="stat-label">Kelas</span>
            </div>
          </div>

          {/* Quick Links */}
          <section className="section" style={{ paddingTop: 0 }}>
            <div className="section-head">
              <div>
                <h2 className="section-title">Menu Utama</h2>
                <p className="section-subtitle">Akses cepat ke fitur pembelajaran.</p>
              </div>
            </div>
            <div className="grid grid-3">
              <Link href="/materi" className="card" style={{ textDecoration: 'none' }}>
                <h3 className="card-title">Materi</h3>
                <p className="card-desc">Pelajari materi Informatika sesuai kurikulum.</p>
              </Link>
              <Link href="/tugas" className="card" style={{ textDecoration: 'none' }}>
                <h3 className="card-title">Tugas</h3>
                <p className="card-desc">Lihat dan kerjakan tugas yang diberikan guru.</p>
              </Link>
              <Link href="/quiz" className="card" style={{ textDecoration: 'none' }}>
                <h3 className="card-title">Quiz</h3>
                <p className="card-desc">Uji pemahamanmu dengan quiz interaktif.</p>
              </Link>
              <Link href="/playground" className="card" style={{ textDecoration: 'none' }}>
                <h3 className="card-title">Playground</h3>
                <p className="card-desc">Coba coding HTML, CSS, dan JavaScript langsung.</p>
              </Link>
              <Link href="/portfolio" className="card" style={{ textDecoration: 'none' }}>
                <h3 className="card-title">Portfolio</h3>
                <p className="card-desc">Kelola karya dan project Informatikamu.</p>
              </Link>
              <Link href="/karya" className="card" style={{ textDecoration: 'none' }}>
                <h3 className="card-title">Karya</h3>
                <p className="card-desc">Lihat dan bagikan karyamu ke teman sekelas.</p>
              </Link>
            </div>
          </section>

          {/* Next Materials */}
          <section className="section" style={{ paddingTop: 0 }}>
            <div className="section-head">
              <div>
                <h2 className="section-title">Lanjut Belajar</h2>
                <p className="section-subtitle">Materi yang belum kamu selesaikan.</p>
              </div>
              <Link href="/materi" className="button button-ghost">
                Semua materi →
              </Link>
            </div>
            {loading ? (
              <div className="card" style={{ padding: 32, textAlign: 'center' }}>
                Memuat materi...
              </div>
            ) : nextMaterials.length === 0 ? (
              <div className="card" style={{ padding: 32, textAlign: 'center' }}>
                <h3 className="card-title">Semua materi sudah selesai!</h3>
                <p className="card-desc">Kerja bagus! Lanjut eksplorasi materi lainnya.</p>
              </div>
            ) : (
              <div className="grid grid-2">
                {nextMaterials.map((m) => (
                  <Link
                    key={m.id}
                    href={`/materi/${m.slug || m.id}`}
                    className="card"
                    style={{ textDecoration: 'none' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <h3 className="card-title">{m.title}</h3>
                      <span className="tag">{m.progress}%</span>
                    </div>
                    <div style={{ width: '100%', height: 6, background: 'var(--surface-2)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${m.progress}%`, height: '100%', background: 'var(--text)', borderRadius: 3 }} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </Shell>
    </RoleGuard>
  );
}
