'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserMenu } from './user-menu';
import { MobileAuthNav } from './mobile-auth-nav';
import { ThemeToggle } from './theme-toggle';

export function Header() {
  const pathname = usePathname();
  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  return (
    <>
      <div className="navwrap">
        <nav className="nav">
          <Link href="/"><img className="nav-logo" src="/chexo.webp" alt="Logo SMAN 1 Cicalengka" /></Link>
          <Link className={isActive('/') ? 'active' : ''} href="/"><span className="icon">home</span><span className="label">Beranda</span></Link>
          <Link className={isActive('/materi') ? 'active' : ''} href="/materi"><span className="icon">school</span><span className="label">Materi</span></Link>
          <Link className={isActive('/tugas') ? 'active' : ''} href="/tugas"><span className="icon">assignment</span><span className="label">Tugas</span></Link>
          <Link className={isActive('/karya') ? 'active' : ''} href="/karya"><span className="icon">photo_library</span><span className="label">Karya</span></Link>
          <Link className={isActive('/playground') ? 'active' : ''} href="/playground"><span className="icon">terminal</span><span className="label">Playground</span></Link>
          <ThemeToggle />
          <span style={{ marginLeft: 4 }}><UserMenu /></span>
        </nav>
      </div>

      <div className="theme-fab-mobile"><ThemeToggle /></div>

      <nav className="bottom-nav">
        <Link className={isActive('/') ? 'active' : ''} href="/"><span className="icon">home</span>Beranda</Link>
        <Link className={isActive('/materi') ? 'active' : ''} href="/materi"><span className="icon">school</span>Materi</Link>
        <Link className={isActive('/tugas') ? 'active' : ''} href="/tugas"><span className="icon">assignment</span>Tugas</Link>
        <Link className={isActive('/karya') ? 'active' : ''} href="/karya"><span className="icon">photo_library</span>Karya</Link>
        <Link className={isActive('/playground') ? 'active' : ''} href="/playground"><span className="icon">terminal</span>Coding</Link>
        <MobileAuthNav />
      </nav>
    </>
  );
}
