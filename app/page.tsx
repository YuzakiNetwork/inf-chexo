import Link from 'next/link';
import { materials, tasks } from '@/lib/data';

export default function Home() {
  return (
    <>
      <div className="hero-wrap">
        <div className="hero-card">
          <img className="crest" src="/chexo-emblem-logo.webp" alt="Chexo Crest" />
          <div className="hero-text">
            <div className="eyebrow-chip">Ekosistem digital kelas Informatika</div>
            <h1>Semua yang kamu butuhkan buat kelas Informatika, ngumpul di satu layar.</h1>
            <p>Catat progres belajar, kerjakan tugas, latihan lewat kuis, coba kode langsung di playground, sampai pajang hasil karya — tanpa pindah-pindah aplikasi.</p>
            <div className="hero-actions">
              <Link className="btn-tonal" href="/materi">Lihat jalur belajar</Link>
              <Link className="btn-filled" href="/login" style={{background:'var(--on-primary-container)', color:'var(--primary-container)'}}>Buka portal saya <span className="icon">arrow_forward</span></Link>
            </div>
          </div>
        </div>
      </div>

      <div className="chip-row">
        <div className="stat-chip"><div className="num-badge">8</div><span>Elemen inti Informatika</span></div>
        <div className="stat-chip"><div className="num-badge">3</div><span>Kegiatan menanti dikerjakan</span></div>
        <div className="stat-chip"><div className="num-badge">2</div><span>Cara latihan coding</span></div>
        <div className="stat-chip"><div className="num-badge">1</div><span>Ruang belajar terpadu</span></div>
      </div>

      <section>
        <h2 className="section-title">Jalur Belajar</h2>
        <p className="section-sub">Enam modul, dari konsep dasar sampai praktik langsung.</p>
        <div className="card-grid">
          {materials.slice(0,6).map((m: any, i: number) => {
            const badges = ['badge-a','badge-b','badge-c'];
            return (
              <div key={m.id} className="m-card">
                <div className={`badge-circle ${badges[i%3]}`}>
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

      <section>
        <h2 className="section-title">Yang Perlu Dikerjakan</h2>
        <p className="section-sub">Daftar kegiatan kelas yang sedang berjalan.</p>
        <div style={{background:'var(--surface)', borderRadius:'20px', overflow:'hidden', boxShadow:'0 1px 2px rgba(0,0,0,0.08)'}}>
          {tasks.slice(0,3).map((t: any) => (
            <div key={t.id} style={{display:'flex', alignItems:'flex-start', gap:'16px', padding:'18px 22px', borderBottom:'1px solid var(--outline-variant)'}}>
              <div style={{width:'40px', height:'40px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--surface-container-high)', color:'var(--on-surface-variant)'}}><span className="icon">schedule</span></div>
              <div style={{flex:1}}>
                <div style={{fontSize:'12px', color:'var(--on-surface-variant)', marginBottom:'2px'}}>TUGAS · XI-1</div>
                <h3 style={{fontSize:'15px', fontWeight:'500', margin:'0 0 4px'}}>{t.title}</h3>
                <p style={{fontSize:'13px', color:'var(--on-surface-variant)', margin:'0'}}>{t.desc}</p>
              </div>
              <div style={{display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'6px'}}>
                <span style={{fontSize:'11px', fontWeight:'500', padding:'5px 12px', borderRadius:'100px', background:'var(--tertiary-container)', color:'var(--on-tertiary-container)'}}>Belum dikerjakan</span>
                <span style={{fontSize:'12px', color:'var(--on-surface-variant)'}}>Tenggat {new Date(t.due).toLocaleDateString('id-ID', {day:'2-digit', month:'short'})}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Link className="fab" href="/playground"><span className="icon">terminal</span>Coba Playground</Link>
    </>
  );
}
