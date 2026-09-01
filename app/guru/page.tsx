'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Shell } from '@/components/shell';
import { RoleGuard } from '@/components/role-guard';
import { getSupabaseBrowserClient } from '@/lib/supabase';

type Row = {
  id: string;
  title: string;
  deadline: string | null;
  class_id: string | null;
  classes?: { name: string }[] | null;
};

type Submission = {
  id: string;
  assignment_id: string;
  student_id: string;
  grade: number | null;
  feedback: string | null;
  submitted_at: string;
  drive_file_id: string | null;
  assignments?: { title: string }[] | null;
  profiles?: { full_name: string | null }[] | null;
};

export default function Guru() {
  const [tasks, setTasks] = useState<Row[]>([]);
  const [subs, setSubs] = useState<Submission[]>([]);
  const [materials, setMaterials] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const sb = getSupabaseBrowserClient();
      if (!sb) return;
      const [{ data: t }, { data: s }, { count: m }] = await Promise.all([
        sb.from('assignments').select('id,title,deadline,class_id,classes(name)').order('deadline', { ascending: true }),
        sb.from('submissions').select('id,assignment_id,student_id,grade,feedback,submitted_at,drive_file_id,assignments(title),profiles(full_name)').order('submitted_at', { ascending: false }),
        sb.from('materials').select('*', { count: 'exact', head: true }),
      ]);
      setTasks((t || []) as Row[]);
      setSubs((s || []) as Submission[]);
      setMaterials(m || 0);
      setLoading(false);
    })();
  }, []);

  const grade = async (s: Submission) => {
    const sb = getSupabaseBrowserClient();
    if (!sb) return;
    const { error } = await sb.from('submissions').update({
      grade: s.grade,
      feedback: s.feedback,
    }).eq('id', s.id);
    if (error) alert(error.message);
  };

  return (
    <RoleGuard role="guru">
      <Shell>
        <div className="container">
          <div className="page-head">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <span className="tag" style={{ marginBottom: 12 }}>Portal Guru</span>
                <h1>Kelola Pembelajaran</h1>
                <p>Tugas, materi, submission, dan penilaian terhubung ke Supabase.</p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Link href="/guru/materi" className="button button-primary">Kelola Materi</Link>
                <Link href="/guru/tugas" className="button">Kelola Tugas</Link>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="stats" style={{ marginBottom: 32 }}>
            <div className="stat">
              <span className="stat-value">{loading ? '—' : tasks.length}</span>
              <span className="stat-label">Tugas Tersimpan</span>
            </div>
            <div className="stat">
              <span className="stat-value">{loading ? '—' : subs.length}</span>
              <span className="stat-label">Submission Masuk</span>
            </div>
            <div className="stat">
              <span className="stat-value">{loading ? '—' : materials}</span>
              <span className="stat-label">Materi Tersimpan</span>
            </div>
            <div className="stat">
              <span className="stat-value">{loading ? '—' : subs.filter(s => s.grade !== null).length}</span>
              <span className="stat-label">Sudah Dinilai</span>
            </div>
          </div>

          {/* Recent Tasks */}
          <section className="section" style={{ paddingTop: 0 }}>
            <div className="section-head">
              <div>
                <h2 className="section-title">Tugas Terbaru</h2>
                <p className="section-subtitle">Daftar tugas yang telah dibuat.</p>
              </div>
              <Link href="/guru/tugas" className="button button-ghost">Kelola tugas →</Link>
            </div>
            {tasks.length === 0 ? (
              <div className="card" style={{ padding: 32, textAlign: 'center' }}>
                <p className="card-desc">Belum ada tugas. Buat tugas pertama di halaman Kelola Tugas.</p>
              </div>
            ) : (
              <div className="grid">
                {tasks.slice(0, 5).map((t) => (
                  <div key={t.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
                    <div>
                      <h3 className="card-title">{t.title}</h3>
                      <p className="card-desc">{t.classes?.[0]?.name || 'Semua Kelas'}</p>
                    </div>
                    <span className="tag">
                      {t.deadline ? new Date(t.deadline).toLocaleDateString('id-ID') : 'Tanpa deadline'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Submissions to Grade */}
          <section className="section" style={{ paddingTop: 0 }}>
            <div className="section-head">
              <div>
                <h2 className="section-title">Submission Terbaru</h2>
                <p className="section-subtitle">Tugas yang dikumpulkan siswa.</p>
              </div>
            </div>
            {subs.length === 0 ? (
              <div className="card" style={{ padding: 32, textAlign: 'center' }}>
                <p className="card-desc">Belum ada submission.</p>
              </div>
            ) : (
              <div className="grid">
                {subs.slice(0, 5).map((s) => (
                  <div key={s.id} className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div>
                        <h3 className="card-title">{s.profiles?.[0]?.full_name || 'Siswa'}</h3>
                        <p className="card-desc">{s.assignments?.[0]?.title || 'Tugas'}</p>
                      </div>
                      <span className="tag">
                        {new Date(s.submitted_at).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                      <input
                        className="input"
                        style={{ maxWidth: 100 }}
                        type="number"
                        min="0"
                        max="100"
                        placeholder="Nilai"
                        defaultValue={s.grade ?? ''}
                        onBlur={(e) => {
                          const val = e.target.value === '' ? null : Number(e.target.value);
                          grade({ ...s, grade: val });
                        }}
                      />
                      <input
                        className="input"
                        style={{ flex: 1 }}
                        placeholder="Feedback"
                        defaultValue={s.feedback || ''}
                        onBlur={(e) => grade({ ...s, feedback: e.target.value })}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </Shell>
    </RoleGuard>
  );
}
