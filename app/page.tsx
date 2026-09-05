'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Shell } from '@/components/shell';
import { fetchMaterials } from '@/lib/materials';
import { fetchTasks } from '@/lib/tasks';
import type { Material } from '@/lib/data';
import type { Task } from '@/lib/tasks';

export default function Home() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([fetchMaterials(), fetchTasks(3)]).then(([m, t]) => {
      if (!active) return;
      setMaterials(m.data);
      setTasks(t.data);
      setLoading(false);
    });
    return () => { active = false; };
  }, []);

  return (
    <Shell>
      <section className="hero">
        <div className="hero-inner">
          <div className="blob">
            <img className="crest" src="/chexo.webp" alt="Lambang SMAN 1 Cicalengka" />
          </div>
          <div className="hero-copy">
            <div className="eyebrow"><span className="icon" style={{fontSize:'15px'}}>bolt</span> Khusus mapel Informatika · Chexo</div>
            <h1>Ruang belajar <span className="accent">Informatika</span> anak Chexo.</h1>
            <p>Chexo itu sebutan akrab buat SMAN 1 Cicalengka — dan ruang ini rumah digital khusus mapel Informatika: materi, tugas, kuis, tempat ngoding langsung, sampai galeri karya, semuanya di satu tempat.</p>
            <div className="hero-actions">
              <Link className="btn btn-filled" href="/materi"><span className="icon">explore</span>Mulai belajar</Link>
              <Link className="btn btn-tonal" href="/playground"><span className="icon">terminal</span>Coba Playground</Link>
            </div>
          </div>
        </div>
      </section>

      <div className="beans">
        <div className="bean"><div className="bean-icon">{loading ? '·' : materials.length}</div><span className="bean-text">Materi tersedia</span></div>
        <div className="bean"><div className="bean-icon">{loading ? '·' : tasks.length}</div><span className="bean-text">Tugas terdekat</span></div>
        <div className="bean"><div className="bean-icon">2</div><span className="bean-text">Cara latihan coding</span></div>
        <div className="bean"><div className="bean-icon">1</div><span className="bean-text">Ruang belajar terpadu</span></div>
      </div>

      <section className="section">
        <div className="section-head">
          <div><h2>Jalur Belajar</h2><p className="section-subtitle">Materi diambil langsung dari Supabase — begitu guru menambah materi, otomatis muncul di sini.</p></div>
          <Link href="/materi">Lihat semua →</Link>
        </div>
        <div className="m-grid">
          {materials.slice(0,6).map((m: any, i: number) => {
            const badges = ['badge-a','badge-b','badge-c'];
            return (
              <div key={m.id} className="m-card">
                <div className={`m-icon ${badges[i%3]}`}>
                  <span className="icon">lightbulb</span>
                </div>
                <h3>{m.title}</h3>
                <p>{m.desc}</p>
                <Link className="card-link" href={`/materi#${m.id}`}>Buka modul <span className="icon" style={{fontSize:'16px'}}>arrow_forward</span></Link>
              </div>
            )
          })}
          {!loading && !materials.length && <p className="muted">Belum ada materi.</p>}
        </div>
      </section>

      <section className="section section-tinted">
        <div className="section-head">
          <div><h2>Yang Perlu Dikerjakan</h2><p className="section-subtitle">Tugas dengan tenggat terdekat, langsung dari Supabase.</p></div>
        </div>
        <div className="tasklist">
          {tasks.map((t) => (
            <div key={t.id} className="task-row">
              <div className="task-status"><span className="icon">schedule</span></div>
              <div className="task-body">
                <div className="task-meta">{t.subject} · {t.className}</div>
                <h3>{t.title}</h3>
                <p>{t.description}</p>
              </div>
              <div className="task-right">
                <span className="task-chip pending">Belum dikerjakan</span>
                <span className="task-date">Tenggat {new Date(t.deadline).toLocaleDateString('id-ID', {day:'2-digit', month:'short'})}</span>
              </div>
            </div>
          ))}
          {!loading && !tasks.length && <p className="muted">Belum ada tugas.</p>}
        </div>
      </section>

      <Link className="fab" href="/playground"><span className="icon">terminal</span>Coba Playground</Link>
    </Shell>
  );
}
