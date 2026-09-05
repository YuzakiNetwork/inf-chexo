'use client';

import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.getAttribute('data-theme') === 'dark');
  }, []);

  const toggle = () => {
    const next = dark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('chexo-theme', next); } catch {}
    setDark(!dark);
  };

  return (
    <button type="button" className="theme-toggle" onClick={toggle} aria-label="Ganti tema terang/gelap">
      <span className="icon">{dark ? 'light_mode' : 'dark_mode'}</span>
    </button>
  );
}
