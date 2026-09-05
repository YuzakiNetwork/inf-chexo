import Link from 'next/link';
import Image from 'next/image';
import { UserMenu } from './user-menu';

export function Header() {
  return (
    <header className="appbar">
      <div className="appbar-left">
        <Link href="/">
          <img src="/chexo.webp" alt="CHEXO" />
        </Link>
        <span className="appbar-title">Chexo</span>
      </div>
      <nav className="appbar-nav">
        <Link className="nav-pill" href="#">Jalur Belajar</Link>
        <Link className="nav-pill" href="#">Kegiatan</Link>
        <Link className="nav-pill" href="/quiz">Kuis</Link>
        <Link className="nav-pill" href="/playground">Playground</Link>
        <Link className="nav-pill" href="/portfolio">Portofolio</Link>
      </nav>
      <Link href="/login" className="btn-filled">Masuk</Link>
    </header>
  );
}
