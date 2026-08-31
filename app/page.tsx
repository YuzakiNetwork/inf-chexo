import Link from 'next/link';
import Image from 'next/image';
import { Shell } from '@/components/shell';
import { materials, tasks } from '@/lib/data';

export default function Home() {
  return (
    <Shell>
      <div className="container">
        <section className="hero">
          <div>
            <div className="hero-eyebrow">Platform Pembelajaran Informatika</div>
            <h1>Belajar informatika dengan cara yang simpel.</h1>
            <p>
              Materi, tugas, quiz, coding playground, dan portofolio dalam satu
              tempat. Dirancang untuk siswa SMAN 1 Cicalengka.
            </p>
            <div className="hero-actions">
              <Link className="button button-primary" href="/login">
                Masuk ke Portal
              </Link>
              <Link className="button" href="/materi">
                Jelajahi Materi
              </Link>
            </div>
          </div>
          <div className="hero-visual">
            <Image
              src="/chexo.webp"
              alt="Logo SMAN 1 Cicalengka"
              width={280}
              height={280}
              className="hero-logo"
              priority
            />
          </div>
        </section>

        <section className="section">
          <div className="stats">
            <div className="stat">
              <span className="stat-value">8</span>
              <span className="stat-label">Elemen Informatika</span>
            </div>
            <div className="stat">
              <span className="stat-value">3</span>
              <span className="stat-label">Tugas Aktif</span>
            </div>
            <div className="stat">
              <span className="stat-value">2</span>
              <span className="stat-label">Mode Coding</span>
            </div>
            <div className="stat">
              <span className="stat-value">1</span>
              <span className="stat-label">Ekosistem Belajar</span>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="section-head">
            <div>
              <h2 className="section-title">Materi Pembelajaran</h2>
              <p className="section-subtitle">Mulai dari konsep dasar hingga praktik coding.</p>
            </div>
            <Link href="/materi" className="button button-ghost">
              Lihat semua →
            </Link>
          </div>
          <div className="grid grid-3">
            {materials.slice(0, 6).map((m, i) => (
              <Link
                key={m.id}
                href={`/materi#${m.id}`}
                className="card"
                style={{ textDecoration: 'none' }}
              >
                <span className="tag" style={{ marginBottom: 12 }}>
                  0{i + 1} · {m.tag}
                </span>
                <h3 className="card-title">{m.title}</h3>
                <p className="card-desc">{m.desc}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="section-head">
            <div>
              <h2 className="section-title">Tugas Terbaru</h2>
              <p className="section-subtitle">Tugas yang perlu kamu selesaikan.</p>
            </div>
            <Link href="/tugas" className="button button-ghost">
              Buka tugas →
            </Link>
          </div>
          <div className="grid">
            {tasks.map((t) => (
              <div className="card task" key={t.id}>
                <div>
                  <span className="tag" style={{ marginBottom: 8 }}>
                    {t.subject} · {t.className}
                  </span>
                  <h3 className="card-title">{t.title}</h3>
                  <p className="card-desc">{t.description}</p>
                  <span
                    className={`status ${
                      t.status === 'Sudah dinilai' ? 'status-success' : 'status-warning'
                    }`}
                    style={{ marginTop: 12 }}
                  >
                    {t.status}
                  </span>
                </div>
                <span className="deadline">
                  {new Date(t.deadline).toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: 'short',
                  })}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </Shell>
  );
}
