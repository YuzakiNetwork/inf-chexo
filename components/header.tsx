import Link from 'next/link';
import Image from 'next/image';

export function Header() {
  return (
    <header className="site-header">
      <Link href="/" className="brand">
        <Image
          src="/chexo.webp"
          alt="Logo SMAN 1 Cicalengka"
          width={32}
          height={32}
          className="brand-logo"
        />
        <div className="brand-text">
          <strong>CHEXO</strong>
          <small>SMAN 1 Cicalengka</small>
        </div>
      </Link>
      <nav className="nav-links" aria-label="Navigasi utama">
        <Link href="/materi">Materi</Link>
        <Link href="/tugas">Tugas</Link>
        <Link href="/quiz">Quiz</Link>
        <Link href="/playground">Playground</Link>
        <Link href="/portfolio">Portfolio</Link>
      </nav>
      <Link href="/login" className="button button-primary">Masuk</Link>
    </header>
  );
}
