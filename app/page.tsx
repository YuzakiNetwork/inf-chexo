import Link from 'next/link';
import { materials, tasks } from '@/lib/data';
import { Shell } from '@/components/shell';

export default function Home() {
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
            <p>Website ini adalah rumah digital khusus mapel Informatika: materi, tugas, kuis, tempat ngoding langsung, sampai galeri karya, semuanya di satu tempat.</p>
            <div className="hero-actions">
              <Link className="btn btn-filled" href="/materi"><span className="icon">explore</span>Mulai belajar</Link>
              <Link className="btn btn-tonal" href="/playground"><span className="icon">terminal</span>Coba Playground</Link>
            </div>
          </div>
        </div>
      </section>

      <div className="beans">
        <div className="bean"><div className="bean-icon">8</div><span className="bean-text">Elemen inti Informatika</span></div>
        <div className="bean"><div className="bean-icon">3</div><span className="bean-text">Kegiatan menanti dikerjakan</span></div>
        <div className="bean"><div className="bean-icon">2</div><span className="bean-text">Cara latihan coding</span></div>
        <div className="bean"><div className="bean-icon">1</div><span className="bean-text">Ruang belajar terpadu</span></div>
      </div>

      <section className="section">
        <div className="section-head">
          <div><h2>Jalur Belajar</h2><p className="section-subtitle">Enam modul, dari konsep dasar sampai praktik langsung.</p></div>
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
        </div>
      </section>

      <section className="section section-tinted">
        <div className="section-head">
          <div><h2>Yang Perlu Dikerjakan</h2><p className="section-subtitle">Kegiatan kelas yang sedang berjalan.</p></div>
        </div>
        <div className="tasklist">
          {tasks.slice(0,3).map((t: any) => (
            <div key={t.id} className="task-row">
              <div className="task-status"><span className="icon">schedule</span></div>
              <div className="task-body">
                <div className="task-meta">Tugas · XI-1</div>
                <h3>{t.title}</h3>
                <p>{t.desc}</p>
              </div>
              <div className="task-right">
                <span className="task-chip pending">Belum dikerjakan</span>
                <span className="task-date">Tenggat {new Date(t.due).toLocaleDateString('id-ID', {day:'2-digit', month:'short'})}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Link className="fab" href="/playground"><span className="icon">terminal</span>Coba Playground</Link>
    </Shell>
  );
}
