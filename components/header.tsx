import Link from 'next/link';

export function Header() {
  return (
    <div className="navwrap">
      <nav className="nav">
        <Link href="/"><img className="nav-logo" src="/chexo.webp" alt="Logo SMAN 1 Cicalengka" /></Link>
        <Link className="active" href="/"><span className="icon">home</span><span className="label">Beranda</span></Link>
        <Link href="/materi"><span className="icon">school</span><span className="label">Materi</span></Link>
        <Link href="/tugas"><span className="icon">assignment</span><span className="label">Tugas</span></Link>
        <Link href="/quiz"><span className="icon">quiz</span><span className="label">Kuis</span></Link>
        <Link href="/playground"><span className="icon">terminal</span><span className="label">Playground</span></Link>
        <Link className="cta" href="/login"><span className="icon">login</span><span className="label">Masuk</span></Link>
      </nav>
    </div>
  );
}
