'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';

const fallbackSubjects = [
  { name: 'Algoritma', value: 92 },
  { name: 'Pemrograman', value: 86 },
  { name: 'Basis Data', value: 78 },
  { name: 'Web', value: 94 },
  { name: 'Jaringan', value: 81 },
  { name: 'Dampak Sosial', value: 88 },
];

const schedule = [
  { time: '09:45', title: 'Algoritma & Pemrograman', room: 'Ruang Lab 1', active: true },
  { time: '11:00', title: 'Basis Data', room: 'Ruang Lab 1', active: false },
  { time: '13:00', title: 'Pengembangan Web', room: 'Ruang Lab 2', active: false },
];

const events = [
  { day: '18', month: 'AGT', title: 'Deadline Website Portfolio', type: 'Tugas' },
  { day: '21', month: 'AGT', title: 'Quiz Jaringan Komputer', type: 'Quiz' },
];

type DashboardMaterial = {
  id: string;
  slug: string | null;
  title: string;
  progress: number;
};

type StudentProfile = {
  full_name: string | null;
  role: 'student' | 'teacher' | null;
  class_id: string | null;
  className?: string | null;
};

function Icon({ children }: { children: React.ReactNode }) {
  return <span className="dash-icon" aria-hidden="true">{children}</span>;
}

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'NS';
}

export default function SiswaDashboard() {
  const [dark, setDark] = useState(true);
  const [openMenu, setOpenMenu] = useState(false);
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

        const materialIds = (materialRows || []).map((item) => item.id);
        const { data: progressRows, error: progressError } = materialIds.length
          ? await supabase.from('learning_progress').select('material_id, progress').eq('student_id', user.id).in('material_id', materialIds)
          : { data: [], error: null };

        if (progressError) throw progressError;

        const progressMap = new Map((progressRows || []).map((row) => [row.material_id, row.progress]));
        const classValue = Array.isArray(profile?.classes) ? profile?.classes[0]?.name : profile?.classes?.name;

        if (mounted) {
          setStudent({
            full_name: profile?.full_name || user.user_metadata?.full_name || user.email || null,
            role: profile?.role || null,
            class_id: profile?.class_id || null,
            className: classValue || null,
          });
          setMaterials((materialRows || []).map((item) => ({
            id: item.id,
            slug: item.slug,
            title: item.title,
            progress: progressMap.get(item.id) ?? 0,
          })));
        }
      } catch (error) {
        console.error('[CHEXO] dashboard data error', error);
        if (mounted) setDataError('Data Supabase belum dapat dimuat. Dashboard menggunakan data sementara.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, []);

  const displayName = student?.full_name || 'Nyaruka';
  const className = student?.className || 'XI';
  const subjectProgress = materials.length
    ? materials.slice(0, 6).map((item) => ({ name: item.title.replace(' dan ', ' & '), value: item.progress }))
    : fallbackSubjects;
  const average = subjectProgress.length
    ? Math.round(subjectProgress.reduce((sum, item) => sum + item.value, 0) / subjectProgress.length * 10) / 10
    : 0;
  const completed = materials.filter((item) => item.progress >= 100).length;
  const overallProgress = materials.length
    ? Math.round(materials.reduce((sum, item) => sum + item.progress, 0) / materials.length)
    : 0;

  const nextMaterials = useMemo(
    () => materials.filter((item) => item.progress < 100).slice(0, 2),
    [materials],
  );

  const logout = async () => {
    if (supabase) await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <RoleGuard role="student">
    <main className={`student-dashboard ${dark ? 'theme-dark' : 'theme-light'}`}>
      <aside className="student-sidebar">
        <div className="student-brand">
          <div className="student-brand-mark">C</div>
          <div><strong>CHEXO</strong><span>Informatika</span></div>
        </div>

        <nav className="student-nav" aria-label="Navigasi siswa">
          <Link className="student-nav-item active" href="/siswa"><Icon>⌂</Icon><span>Dashboard</span></Link>
          <Link className="student-nav-item" href="/materi"><Icon>▤</Icon><span>Materi</span></Link>
          <Link className="student-nav-item" href="/tugas"><Icon>✓</Icon><span>Tugas</span></Link>
          <Link className="student-nav-item" href="/quiz"><Icon>?</Icon><span>Quiz</span></Link>
          <Link className="student-nav-item" href="/playground"><Icon>⌘</Icon><span>Playground</span></Link>
          <Link className="student-nav-item" href="/portfolio"><Icon>▧</Icon><span>Portfolio</span></Link>
        </nav>

        <div className="student-sidebar-bottom">
          <Link className="student-nav-item" href="/"><Icon>↩</Icon><span>Kembali ke website</span></Link>
          <button className="student-nav-item student-logout" type="button" onClick={logout}><Icon>↪</Icon><span>Keluar</span></button>
        </div>
      </aside>

      <section className="student-main">
        <header className="student-topbar">
          <div className="student-search"><span>⌕</span><input aria-label="Cari" placeholder="Cari materi, tugas, atau halaman..." /></div>
          <div className="student-top-actions">
            <button className="icon-button" type="button" onClick={() => setDark(!dark)} aria-label="Ubah tema">{dark ? '☼' : '☾'}</button>
            <button className="icon-button notification" type="button" aria-label="Notifikasi">♢<i /></button>
            <button className="student-profile-button" type="button" onClick={() => setOpenMenu(!openMenu)}>
              <span className="avatar avatar-photo">{initials(displayName)}</span>
              <span className="profile-copy"><strong>{displayName}</strong><small>Siswa · {className}</small></span>
              <span>⌄</span>
            </button>
            {openMenu && <div className="profile-menu"><strong>{displayName}</strong><span>Kelas {className} · Informatika</span><Link href="/portfolio">Lihat portfolio</Link></div>}
          </div>
        </header>

        <div className="student-content">
          <div className="student-heading">
            <div>
              <span className="student-eyebrow">Portal siswa</span>
              <h1>Dashboard</h1>
              <p>Pantau pembelajaran Informatika, tugas, dan perkembanganmu dalam satu tempat.</p>
            </div>
            <button className="date-pill" type="button">{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })} <span>⌄</span></button>
          </div>

          {dataError && <div role="status" style={{ marginBottom: 18, padding: '12px 14px', border: '1px solid rgba(59,130,246,.35)', borderRadius: 12, background: 'rgba(59,130,246,.08)', fontSize: 13 }}>{dataError}</div>}

          <section className="welcome-card">
            <div>
              <span className="welcome-label">SELAMAT DATANG KEMBALI</span>
              <h2>Halo, {displayName}!</h2>
              <p>Kamu telah menyelesaikan <strong>{completed} dari {materials.length || 8} materi</strong>. Lanjutkan materi berikutnya agar progress belajarmu tetap berjalan.</p>
              <Link href={nextMaterials[0]?.slug ? `/materi/${nextMaterials[0].slug}` : '/materi'} className="welcome-link">{nextMaterials.length ? 'Lanjutkan belajar' : 'Lihat semua materi'} <span>→</span></Link>
            </div>
            <div className="welcome-art" aria-hidden="true"><span>CHEXO</span><b>{overallProgress}%</b></div>
          </section>

          <section className="dashboard-grid">
            <div className="dashboard-left">
              <div className="section-title-row"><div><span className="section-kicker">Performa</span><h2>Perkembangan belajar</h2></div><span className="small-pill">Data Supabase</span></div>
              <div className="performance-card">
                <div className="performance-head"><div><span>Rata-rata progress materi</span><strong>{loading ? '—' : average}</strong></div><span className="trend">{materials.length ? `${completed}/${materials.length}` : '—'} <small>materi selesai</small></span></div>
                <div className="bar-chart">
                  {subjectProgress.map((subject) => <div className="bar-item" key={subject.name}><div className="bar-track"><div className="bar-fill" style={{ height: `${Math.max(subject.value, 3)}%` }} /></div><strong>{subject.value}</strong><span>{subject.name}</span></div>)}
                </div>
              </div>

              <div className="section-title-row compact"><div><span className="section-kicker">Aktivitas</span><h2>Materi berikutnya</h2></div><Link href="/materi" className="see-all">Lihat semua →</Link></div>
              <div className="task-card-list">
                {nextMaterials.length ? nextMaterials.map((item) => (
                  <Link href={item.slug ? `/materi/${item.slug}` : '/materi'} className="task-card" key={item.id}>
                    <span className="task-dot task-blue">{item.title.slice(0, 2).toUpperCase()}</span>
                    <span className="task-main"><strong>{item.title}</strong><small>{item.progress}% selesai</small></span>
                    <span className="task-date"><strong>{item.progress}</strong><small>%</small></span>
                    <span className="task-arrow">→</span>
                  </Link>
                )) : <div style={{ padding: 18, border: '1px dashed rgba(148,163,184,.35)', borderRadius: 12, fontSize: 13 }}>Semua materi sudah selesai. 🎉</div>}
              </div>
            </div>

            <aside className="dashboard-right">
              <div className="section-title-row"><div><span className="section-kicker">Progress</span><h2>Materi dikuasai</h2></div></div>
              <div className="progress-card">
                {(materials.length ? materials.slice(0, 6) : fallbackSubjects.map((item, index) => ({ id: String(index), slug: null, title: item.name, progress: item.value }))).map((subject) => <div className="progress-row" key={subject.id}><span className="progress-ring" style={{ '--progress': `${subject.progress * 3.6}deg` } as React.CSSProperties}><b>{subject.progress}%</b></span><span><strong>{subject.title}</strong><small>{subject.progress >= 80 ? 'Sangat baik' : subject.progress >= 50 ? 'Berjalan baik' : 'Perlu latihan'}</small></span></div>)}
              </div>

              <div className="section-title-row compact"><div><span className="section-kicker">Profil</span><h2>Data siswa</h2></div></div>
              <div className="teacher-card"><span className="avatar teacher-avatar">{initials(displayName)}</span><span><strong>{displayName}</strong><small>Kelas {className} · {student?.role === 'student' ? 'Siswa' : 'Profil CHEXO'}</small></span></div>
              <div className="teacher-card"><span className="avatar teacher-avatar alt">DB</span><span><strong>{loading ? 'Memuat data...' : `${materials.length || 0} materi tersedia`}</strong><small>{overallProgress}% progress keseluruhan</small></span></div>
            </aside>
          </section>

          <section className="bottom-grid">
            <div>
              <div className="section-title-row compact"><div><span className="section-kicker">Jadwal</span><h2>Hari ini</h2></div><button className="small-pill" type="button">Lihat jadwal →</button></div>
              <div className="schedule-card">
                {schedule.map(item => <div className={`schedule-row ${item.active ? 'active' : ''}`} key={item.time}><span className="schedule-time">{item.time}</span><span className="schedule-line" /><span className="schedule-info"><strong>{item.title}</strong><small>{item.room}</small></span>{item.active && <span className="now-badge">Sekarang</span>}</div>)}
              </div>
            </div>
            <div>
              <div className="section-title-row compact"><div><span className="section-kicker">Mendatang</span><h2>Agenda</h2></div><span className="see-all">Lihat semua →</span></div>
              <div className="event-list">{events.map(event => <div className="event-card" key={event.title}><span className="event-date"><b>{event.day}</b><small>{event.month}</small></span><span><strong>{event.title}</strong><small>{event.type} · CHEXO Informatika</small></span><span className="event-more">•••</span></div>)}</div>
            </div>
          </section>
        </div>
      </section>
    </main>
    </RoleGuard>
  );
}
