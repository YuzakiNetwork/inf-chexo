'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { MaterialViewer } from '@/components/material-viewer';
import { fetchMaterialBySlug } from '@/lib/materials';
import type { Material } from '@/lib/data';
import { Shell } from '@/components/shell';

export default function MaterialDetail() {
  const params = useParams<{ id: string }>();
  const [material, setMaterial] = useState<Material | null>(null);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<'supabase' | 'local'>('local');

  useEffect(() => {
    if (!params?.id) return;
    let active = true;
    fetchMaterialBySlug(params.id).then((result) => {
      if (!active) return;
      setMaterial(result.data);
      setSource(result.source);
      setLoading(false);
    });
    return () => { active = false; };
  }, [params?.id]);

  if (loading) return <Shell><main className="material-detail-page"><div className="container material-detail-container"><div className="empty-state card">Memuat materi...</div></div></main></Shell>;
  if (!material) return <Shell><main className="material-detail-page"><div className="container material-detail-container"><div className="empty-state card"><strong>Materi tidak ditemukan</strong><span>Materi mungkin belum dipublikasikan.</span><Link href="/materi" className="button button-dark">Kembali ke materi</Link></div></div></main></Shell>;

  return <Shell><main className="material-detail-page"><div className="container material-detail-container">
    <Link href="/materi" className="back-link">← Kembali ke materi</Link>
    <header className="material-detail-head">
      <div><span className="tag">{material.tag} · {material.duration} · {source === 'supabase' ? 'Online' : 'Demo'}</span><h1>{material.title}</h1><p>{material.desc}</p></div>
      <div className="material-detail-number">{material.id.toUpperCase()}<small> · CHEXO</small></div>
    </header>
    <div className="material-detail-grid">
      <article className="material-reading card">
        <div className="reading-label">Materi pembelajaran</div>
        {material.content.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        <div className="objective-box"><strong>Setelah belajar</strong><ul>{material.objectives.map(item => <li key={item}>{item}</li>)}</ul></div>
      </article>
      <aside className="material-sidebar">
        <MaterialViewer materialId={material.id} />
        <div className="asset-list card"><div className="sidebar-title">Sumber materi</div>{material.assets.map(asset => <a href={asset.url} key={asset.title} className="asset-row"><span className={`asset-icon ${asset.type}`}>{asset.type.toUpperCase().slice(0, 2)}</span><span><strong>{asset.title}</strong><small>{asset.meta}</small></span><b>↗</b></a>)}</div>
      </aside>
    </div>
  </div></main></Shell>;
}
