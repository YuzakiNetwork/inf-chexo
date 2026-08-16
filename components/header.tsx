import Link from 'next/link';

export function Header() {
  return (
    <header className="site-header">
      <Link href="/" className="brand"><span className="brand-mark">C</span><span>CHEXO</span></Link>
      <nav className="nav-links" aria-label="Navigasi utama">
        <Link href="/materi">Materi</Link>
        <Link href="/tugas">Tugas</Link>
        <Link href="/quiz">Quiz</Link>
        <Link href="/playground">Playground</Link>
        <Link href="/portfolio">Portfolio</Link>
      </nav>
      <Link href="/login" className="button button-dark">Masuk</Link>
    </header>
  );
}
