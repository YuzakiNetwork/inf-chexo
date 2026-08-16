'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Shell } from '@/components/shell';
import { fetchMaterials } from '@/lib/materials';
import type { Material } from '@/lib/data';

const assetLabels = { pdf: 'PDF', video: 'Video', link: 'Link', file: 'File' } as const;

export default function MateriPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('Semua');
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<'supabase' | 'local'>('local');

  useEffect(() => {
    let active = true;
    fetchMaterials().then((result) => {
      if (!active) return;
      setMaterials(result.data);
      setSource(result.source);
      setLoading(false);
    });
    return () => { active = false; };
  }, []);

  const tags = ['Semua', ...Array.from(new Set(materials.map((m) => m.tag)))];
  const filtered = useMemo(() => materials.filter((m) => {
    const text = `${m.title} ${m.desc} ${m.element}`.toLowerCase();
    return text.includes(query.toLowerCase()) && (filter === 'Semua' || m.tag === filter);
  }), [materials, query, filter]);

  return <Shell><div className="container">
    <section className="page-head material-library-head">
      <div><div className="eyebrow">Learning library</div><h1>Materi Informatika</h1><p>Materi CHEXO tersimpan di Supabase sehingga konten dapat diperbarui tanpa mengubah kode website.</p></div>
      <div className="library-stat"><strong>{loading ? '—' : materials.length}</strong><span>{source === 'supabase' ? 'materi online' : 'materi demo'}</span></div>
    </section>
    <section className="material-toolbar card">
      <label className="material-search"><span>⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari materi atau topik..." aria-label="Cari materi" /></label>
      <div className="filter-row">{tags.map(tag => <button key={tag} type="button" className={filter === tag ? 'filter active' : 'filter'} onClick={() => setFilter(tag)}>{tag}</button>)}</div>
    </section>
    <section className="section">
      {loading ? <div className="empty-state card"><strong>Memuat materi...</strong><span>Mengambil materi yang dipublikasikan dari Supabase.</span></div> : <div className="material-grid">{filtered.map((m, i) => <article className="material-card" key={m.id}>
        <div className="material-card-top"><span className="tag">{String(i + 1).padStart(2, '0')} · {m.tag}</span><span className="material-duration">{m.duration}</span></div>
        <h2>{m.title}</h2><p>{m.desc}</p>
        <div className="material-assets">{m.assets.map(asset => <span className="asset-chip" key={asset.title}><b>{assetLabels[asset.type]}</b>{asset.title}</span>)}</div>
        <Link href={`/materi/${m.id}`} className="material-open">Buka materi <span>→</span></Link>
      </article>)}</div>}
      {!loading && filtered.length === 0 && <div className="empty-state card"><strong>Materi tidak ditemukan</strong><span>Coba kata kunci atau kategori lain.</span></div>}
    </section>
  </div></Shell>;
}
