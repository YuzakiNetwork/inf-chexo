import Link from 'next/link';
import { UserMenu } from './user-menu';
import { MobileAuthNav } from './mobile-auth-nav';

export function Header() {
  return (
    <>
      <div className="navwrap">
        <nav className="nav">
          <Link href="/"><img className="nav-logo" src="/chexo.webp" alt="Logo SMAN 1 Cicalengka" /></Link>
          <Link className="active" href="/"><span className="icon">home</span><span className="label">Beranda</span></Link>
          <Link href="/materi"><span className="icon">school</span><span className="label">Materi</span></Link>
          <Link href="/tugas"><span className="icon">assignment</span><span className="label">Tugas</span></Link>
          <Link href="/karya"><span className="icon">photo_library</span><span className="label">Karya</span></Link>
          <Link href="/playground"><span className="icon">terminal</span><span className="label">Playground</span></Link>
          <span style={{ marginLeft: 4 }}><UserMenu /></span>
        </nav>
      </div>

      <nav className="bottom-nav">
        <Link className="active" href="/"><span className="icon">home</span>Beranda</Link>
        <Link href="/materi"><span className="icon">school</span>Materi</Link>
        <Link href="/tugas"><span className="icon">assignment</span>Tugas</Link>
        <Link href="/karya"><span className="icon">photo_library</span>Karya</Link>
        <Link href="/playground"><span className="icon">terminal</span>Coding</Link>
        <MobileAuthNav />
      </nav>
    </>
  );
}
