'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Shell } from '@/components/shell';
import { fetchMaterials } from '@/lib/materials';
import type { Material } from '@/lib/data';

const assetLabels: Record<string, string> = {
  pdf: 'PDF',
  video: 'Video',
  link: 'Link',
  file: 'File',
  embed: 'Embed',
};

function getAssetIcon(type: string) {
  switch (type) {
    case 'pdf': return '📄';
    case 'video': return '▶';
    case 'link': return '🔗';
    case 'file': return '📁';
    case 'embed': return '⊞';
    default: return '•';
  }
}

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

  return (
    <Shell>
      <div className="container">
        <div className="page-head">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <span className="tag" style={{ marginBottom: 12 }}>Learning Library</span>
              <h1>Materi Informatika</h1>
              <p>Materi tersimpan di Supabase dan dapat diperbarui tanpa mengubah kode.</p>
            </div>
            <div className="card" style={{ padding: '16px 20px', textAlign: 'center' }}>
              <strong style={{ fontSize: 28, fontWeight: 700 }}>{loading ? '—' : materials.length}</strong>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                {source === 'supabase' ? 'materi online' : 'materi demo'}
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="card" style={{ padding: 16, marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: 240, position: 'relative' }}>
              <input
                className="input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari materi atau topik..."
                style={{ paddingLeft: 36 }}
              />
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }}>⌕</span>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className="button button-sm"
                  style={{
                    background: filter === tag ? 'var(--text)' : 'transparent',
                    color: filter === tag ? 'white' : 'var(--text-secondary)',
                    borderColor: filter === tag ? 'var(--text)' : 'var(--line)',
                  }}
                  onClick={() => setFilter(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Materials Grid */}
        {loading ? (
          <div className="card" style={{ padding: 40, textAlign: 'center' }}>
            Memuat materi...
          </div>
        ) : filtered.length === 0 ? (
          <div className="card" style={{ padding: 40, textAlign: 'center' }}>
            <h3 className="card-title">Materi tidak ditemukan</h3>
            <p className="card-desc">Coba kata kunci atau kategori lain.</p>
          </div>
        ) : (
          <div className="grid grid-2">
            {filtered.map((m, i) => (
              <article className="card" key={m.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <span className="tag">
                    {String(i + 1).padStart(2, '0')} · {m.tag}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{m.duration}</span>
                </div>

                <h3 className="card-title" style={{ fontSize: 18, marginBottom: 8 }}>{m.title}</h3>
                <p className="card-desc" style={{ marginBottom: 16 }}>{m.desc}</p>

                {m.assets.length > 0 && (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                    {m.assets.map((asset) => (
                      <span key={asset.title} className="tag" style={{ fontSize: 11 }}>
                        {getAssetIcon(asset.type)} {assetLabels[asset.type] || asset.type}
                      </span>
                    ))}
                  </div>
                )}

                <Link
                  href={`/materi/${m.id}`}
                  className="button button-sm"
                  style={{ marginTop: 'auto' }}
                >
                  Buka materi →
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </Shell>
  );
}
