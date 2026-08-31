'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { MaterialViewer } from '@/components/material-viewer';
import { BackButton } from '@/components/back-button';
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

  if (loading) {
    return (
      <Shell>
        <div className="container">
          <div className="page-head">
            <BackButton href="/materi" />
            <div className="card" style={{ padding: 40, textAlign: 'center' }}>
              Memuat materi...
            </div>
          </div>
        </div>
      </Shell>
    );
  }

  if (!material) {
    return (
      <Shell>
        <div className="container">
          <div className="page-head">
            <BackButton href="/materi" />
            <div className="card" style={{ padding: 40, textAlign: 'center' }}>
              <h1 style={{ fontSize: 20, margin: '0 0 8px' }}>Materi tidak ditemukan</h1>
              <p className="card-desc" style={{ marginBottom: 16 }}>
                Materi mungkin belum dipublikasikan atau telah dihapus.
              </p>
              <Link href="/materi" className="button button-primary">
                Kembali ke daftar materi
              </Link>
            </div>
          </div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="container">
        <div className="page-head">
          <BackButton href="/materi" />
          <span className="tag" style={{ marginBottom: 12 }}>
            {material.tag} · {material.duration} · {source === 'supabase' ? 'Online' : 'Demo'}
          </span>
          <h1>{material.title}</h1>
          <p>{material.desc}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.6fr) minmax(280px, 1fr)', gap: 24 }}>
          <article className="card" style={{ padding: 32 }}>
            <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', marginBottom: 20 }}>
              Materi Pembelajaran
            </div>
            {material.content.map((paragraph) => (
              <p key={paragraph} style={{ fontSize: 16, lineHeight: 1.7, margin: '0 0 16px' }}>
                {paragraph}
              </p>
            ))}
            <div style={{ marginTop: 28, padding: 20, background: 'var(--surface-2)', borderRadius: 'var(--radius)' }}>
              <strong style={{ fontSize: 14 }}>Setelah belajar, kamu akan bisa:</strong>
              <ul style={{ margin: '12px 0 0', paddingLeft: 20, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                {material.objectives.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </article>

          <aside style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <MaterialViewer materialId={material.id} />
            <div className="card">
              <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', marginBottom: 16 }}>
                Sumber Materi
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {material.assets.map((asset) => (
                  <a
                    href={asset.url}
                    key={asset.title}
                    className="button"
                    style={{ justifyContent: 'space-between', width: '100%' }}
                  >
                    <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                      <strong style={{ fontSize: 13 }}>{asset.title}</strong>
                      <small style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 400 }}>
                        {asset.meta}
                      </small>
                    </span>
                    <span>↗</span>
                  </a>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </Shell>
  );
}
