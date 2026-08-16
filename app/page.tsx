import Link from 'next/link';
import { Shell } from '@/components/shell';
import { materials, tasks } from '@/lib/data';

export default function Home() {
  return <Shell>
    <div className="container">
      <section className="hero">
        <div>
          <div className="eyebrow">CHEXO Ecosystem · Informatika</div>
          <h1>Belajar <span className="highlight">Informatika</span> dengan lebih terarah.</h1>
          <p>Materi, tugas, quiz, coding playground, dan portofolio siswa dalam satu ekosistem pembelajaran yang sederhana dan modern.</p>
          <div className="hero-actions"><Link className="button button-dark" href="/login">Masuk ke portal →</Link><Link className="button button-ghost" href="/materi">Jelajahi materi</Link></div>
        </div>
        <div className="hero-card"><div className="tag">CHEXO Learning Platform</div><div className="big">Learn.<br/>Practice.<br/>Create.</div><p className="muted">Satu ruang untuk memahami konsep, menyelesaikan tugas, mencoba kode, dan mengarsipkan karya Informatika.</p></div>
      </section>

      <section className="section"><div className="stats"><div className="stat"><strong>8</strong><span>Elemen Informatika</span></div><div className="stat"><strong>3</strong><span>Tugas contoh</span></div><div className="stat"><strong>2</strong><span>Mode coding</span></div><div className="stat"><strong>1</strong><span>Ekosistem belajar</span></div></div></section>

      <section className="section">
        <div className="section-head"><div><div className="eyebrow">Core learning</div><h2 className="section-title">Mulai dari materi yang kamu butuhkan.</h2></div><Link href="/materi" className="button button-ghost">Lihat semua →</Link></div>
        <div className="grid grid-3">{materials.slice(0,6).map((m,i)=><Link key={m.id} href={`/materi#${m.id}`} className="card" style={{textDecoration:'none'}}><span className="tag">0{i+1} · {m.tag}</span><h3>{m.title}</h3><p>{m.desc}</p><div className="arrow">→</div></Link>)}</div>
      </section>

      <section className="section"><div className="banner"><div><div className="eyebrow" style={{color:'#dce4ff'}}>CHEXO Playground</div><h2>Belajar coding dengan langsung mencoba.</h2><p className="muted">Tulis HTML, CSS, dan JavaScript lalu lihat hasilnya tanpa meninggalkan CHEXO.</p></div><Link href="/playground" className="button button-yellow">Buka Playground</Link></div></section>

      <section className="section"><div className="section-head"><div><div className="eyebrow">Assignments</div><h2 className="section-title">Tugas yang perlu diselesaikan.</h2></div><Link href="/tugas" className="button button-ghost">Buka tugas →</Link></div><div className="grid">{tasks.map(t=><div className="card task" key={t.id}><div><span className="tag">{t.subject} · {t.className}</span><h3>{t.title}</h3><p>{t.description}</p><span className="status">{t.status}</span></div><div className="deadline">{new Date(t.deadline).toLocaleDateString('id-ID',{day:'2-digit',month:'short'})}</div></div>)}</div></section>
    </div>
  </Shell>;
}
