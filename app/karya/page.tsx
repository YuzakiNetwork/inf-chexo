'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Shell } from '@/components/shell';
import { RoleGuard } from '@/components/role-guard';
import { BackButton } from '@/components/back-button';
import { getSupabaseBrowserClient } from '@/lib/supabase';

// Max file size untuk upload langsung: 5 MB
// Untuk file lebih besar, siswa harus upload ke Google Drive / R2 dan paste link
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 5 MB

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type Karya = {
  id: string;
  student_id: string;
  title: string;
  description: string | null;
  content: string | null;
  project_url: string | null;
  image_url: string | null;
  published: boolean;
  reviewed: boolean;
  teacher_feedback: string | null;
  created_at: string;
};

type Profile = {
  full_name: string | null;
  role: string | null;
};

export default function KaryaPage() {
  const [items, setItems] = useState<Karya[]>([]);
  const [userId, setUserId] = useState('');
  const [role, setRole] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [studentNames, setStudentNames] = useState<Record<string, string>>({});

  const load = async () => {
    const sb = getSupabaseBrowserClient();
    if (!sb) return;

    const { data: { user } } = await sb.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }
    setUserId(user.id);

    const { data: p } = await sb.from('profiles').select('role').eq('id', user.id).maybeSingle();
    const userRole = p?.role || '';
    setRole(userRole);

    // Query karya: siswa hanya lihat sendiri, guru/admin lihat semua
    const query = userRole === 'siswa'
      ? sb.from('karya').select('*').eq('student_id', user.id).order('created_at', { ascending: false })
      : sb.from('karya').select('*').order('created_at', { ascending: false });

    const { data, error: e } = await query;
    if (e) setError(e.message);
    setItems((data || []) as Karya[]);

    // Load student names untuk guru/admin
    if (userRole !== 'siswa' && data && data.length > 0) {
      const studentIds = Array.from(new Set(data.map((d: Karya) => d.student_id)));
      const { data: profiles } = await sb
        .from('profiles')
        .select('id, full_name, nama')
        .in('id', studentIds);
      const nameMap: Record<string, string> = {};
      (profiles || []).forEach((prof: { id: string; full_name: string | null; nama: string | null }) => {
        nameMap[prof.id] = prof.full_name || prof.nama || 'Siswa';
      });
      setStudentNames(nameMap);
    }

    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  const save = async () => {
    const sb = getSupabaseBrowserClient();
    if (!sb || !userId || !title.trim()) return;
    setSaving(true);
    setError('');

    // Double-check file size sebelum upload
    if (file && file.size > MAX_FILE_SIZE) {
      setError(
        `File terlalu besar (${formatFileSize(file.size)}). ` +
        `Maksimal ${formatFileSize(MAX_FILE_SIZE)}. ` +
        `Silakan upload ke Google Drive atau Cloudflare R2, lalu gunakan kolom "Link Project".`
      );
      setSaving(false);
      return;
    }

    let path: string | null = null;
    if (file) {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      path = `karya/${userId}/${Date.now()}-${safeName}`;
      const { error: e } = await sb.storage.from('task-submissions').upload(path, file, { upsert: true });
      if (e) {
        setError(`Upload file gagal: ${e.message}`);
        setSaving(false);
        return;
      }
    }

    const { data, error: e } = await sb.from('karya').insert({
      student_id: userId,
      title: title.trim(),
      description: description.trim() || null,
      project_url: url.trim() || null,
      content: path,
    }).select('*').single();

    if (e) {
      setError(e.message);
    } else {
      setItems((v) => [data as Karya, ...v]);
      setTitle('');
      setDescription('');
      setUrl('');
      setFile(null);
      setOpen(false);
    }
    setSaving(false);
  };

  const remove = async (id: string) => {
    if (!confirm('Hapus karya ini?')) return;
    const sb = getSupabaseBrowserClient();
    if (!sb) return;

    const item = items.find((x) => x.id === id);
    if (item?.content) {
      await sb.storage.from('task-submissions').remove([item.content]);
    }
    const { error: e } = await sb.from('karya').delete().eq('id', id);
    if (e) {
      setError(e.message);
    } else {
      setItems((v) => v.filter((x) => x.id !== id));
    }
  };

  const review = async (id: string, feedback: string) => {
    const sb = getSupabaseBrowserClient();
    if (!sb) return;
    const { error: e } = await sb.from('karya').update({
      reviewed: true,
      teacher_feedback: feedback,
    }).eq('id', id);
    if (e) {
      setError(e.message);
    } else {
      setItems((v) => v.map((x) => x.id === id ? { ...x, reviewed: true, teacher_feedback: feedback } : x));
    }
  };

  return (
    <RoleGuard role={['siswa', 'guru', 'administrator']}>
      <Shell>
        <div className="container">
          <div className="page-head">
            <BackButton href="/" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <span className="tag" style={{ marginBottom: 12 }}>Portfolio</span>
                <h1>Karya Siswa</h1>
                <p>
                  {role === 'siswa'
                    ? 'Upload dan kelola karyamu. Guru akan memberikan review.'
                    : 'Lihat dan review karya siswa.'}
                </p>
              </div>
              {role === 'siswa' && (
                <button className="button button-primary" onClick={() => setOpen(true)}>
                  + Upload Karya
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="card" style={{ marginBottom: 24, padding: 16, background: '#fef2f2', borderColor: '#fecaca' }}>
              <strong style={{ fontSize: 14, color: 'var(--danger)' }}>{error}</strong>
            </div>
          )}

          {/* Info banner untuk siswa */}
          {role === 'siswa' && (
            <div className="card" style={{ marginBottom: 24, padding: 16, background: 'var(--surface-2)', borderColor: 'var(--line)' }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 20 }}>💡</span>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  <strong style={{ color: 'var(--text)' }}>Tips upload karya:</strong>
                  <ul style={{ margin: '6px 0 0', paddingLeft: 20 }}>
                    <li><strong>File kecil (≤ 5 MB)</strong>: thumbnail, preview, screenshot — upload langsung di sini</li>
                    <li><strong>File besar (> 5 MB)</strong>: project .apk, .zip, video demo — upload ke{' '}
                      <a href="https://drive.google.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', fontWeight: 500 }}>
                        Google Drive
                      </a>{' '}atau{' '}
                      <a href="https://github.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', fontWeight: 500 }}>
                        Github
                      </a>{' '}
                      (gratis), lalu paste link publik di kolom <strong>Link Project</strong>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="card" style={{ padding: 40, textAlign: 'center' }}>Memuat karya...</div>
          ) : items.length === 0 ? (
            <div className="card" style={{ padding: 40, textAlign: 'center' }}>
              <h3 className="card-title">Belum ada karya</h3>
              <p className="card-desc">
                {role === 'siswa'
                  ? 'Upload karyamu pertama dengan tombol di atas.'
                  : 'Siswa belum mengupload karya.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-2">
              {items.map((item) => (
                <article key={item.id} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, gap: 8 }}>
                    <div>
                      <h3 className="card-title">{item.title}</h3>
                      {role !== 'siswa' && (
                        <p className="card-desc" style={{ fontSize: 12, marginTop: 4 }}>
                          oleh {studentNames[item.student_id] || 'Siswa'}
                        </p>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {item.reviewed && <span className="status status-success">Reviewed</span>}
                      <span className="tag">
                        {new Date(item.created_at).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                  </div>

                  {item.description && (
                    <p className="card-desc" style={{ marginBottom: 12 }}>{item.description}</p>
                  )}

                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                    {item.project_url && (
                      <a href={item.project_url} target="_blank" rel="noopener noreferrer" className="button button-sm">
                        🔗 Lihat Project
                      </a>
                    )}
                    {item.content && (
                      <a
                        href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/task-submissions/${item.content}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="button button-sm"
                      >
                        📁 Download File
                      </a>
                    )}
                  </div>

                  {item.teacher_feedback && (
                    <div style={{ padding: 12, background: 'var(--surface-2)', borderRadius: 'var(--radius)', marginTop: 12 }}>
                      <strong style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Feedback Guru:</strong>
                      <p style={{ fontSize: 13, margin: '4px 0 0' }}>{item.teacher_feedback}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 8, marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--line)' }}>
                    {role === 'siswa' && item.student_id === userId && (
                      <button
                        className="button button-sm"
                        onClick={() => remove(item.id)}
                        style={{ color: 'var(--danger)' }}
                      >
                        Hapus
                      </button>
                    )}
                    {(role === 'guru' || role === 'administrator') && (
                      <ReviewButton karya={item} onSave={review} />
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Upload Modal */}
          {open && (
            <div style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
              display: 'grid', placeItems: 'center', zIndex: 100, padding: 16,
            }}>
              <div className="card" style={{ width: 'min(480px, 100%)', padding: 24 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 16px' }}>Upload Karya Baru</h2>

                <div className="form">
                  <div>
                    <label>Judul Karya</label>
                    <input
                      className="input"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Contoh: Aplikasi Deteksi Tanaman Herbal"
                    />
                  </div>

                  <div>
                    <label>Deskripsi</label>
                    <textarea
                      className="input"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Jelaskan karyamu..."
                      rows={3}
                      style={{ resize: 'vertical', fontFamily: 'inherit' }}
                    />
                  </div>

                  <div>
                    <label>Link Project (opsional)</label>
                    <input
                      className="input"
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://github.com/username/project atau Google Drive"
                    />
                    <small style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4, display: 'block' }}>
                      Untuk file besar (> 10 MB), upload ke Google Drive / github lalu paste link di sini
                    </small>
                  </div>

                  <div>
                    <label>File Preview/Thumbnail (opsional, max 10 MB)</label>
                    <input
                      className="input"
                      type="file"
                      accept="image/*,.pdf,.zip,.apk,.doc,.docx"
                      onChange={(e) => {
                        const selected = e.target.files?.[0] || null;
                        if (selected && selected.size > MAX_FILE_SIZE) {
                          setError(
                            `File "${selected.name}" terlalu besar (${formatFileSize(selected.size)}). ` +
                            `Maksimal ${formatFileSize(MAX_FILE_SIZE)}. ` +
                            `Untuk file besar, upload ke Google Drive atau GitHub, lalu paste link di kolom "Link Project".`
                          );
                          e.target.value = '';
                          setFile(null);
                          return;
                        }
                        setError('');
                        setFile(selected);
                      }}
                      style={{ padding: 8 }}
                    />
                    <small style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4, display: 'block' }}>
                      {file
                        ? `✓ ${file.name} (${formatFileSize(file.size)})`
                        : 'Hanya untuk file kecil (thumbnail, preview). File project besar gunakan Link Project.'}
                    </small>
                  </div>
                </div>

                {error && (
                  <div className="status status-danger" role="alert" style={{ marginTop: 16 }}>
                    {error}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 8, marginTop: 24 }}>
                  <button
                    className="button button-primary"
                    onClick={save}
                    disabled={saving || !title.trim()}
                    style={{ flex: 1 }}
                  >
                    {saving ? 'Mengupload...' : 'Upload'}
                  </button>
                  <button className="button" onClick={() => setOpen(false)}>Batal</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Shell>
    </RoleGuard>
  );
}

function ReviewButton({ karya, onSave }: { karya: Karya; onSave: (id: string, feedback: string) => void }) {
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState(karya.teacher_feedback || '');

  return (
    <>
      <button className="button button-sm" onClick={() => setOpen(true)}>
        {karya.reviewed ? 'Edit Review' : 'Beri Review'}
      </button>

      {open && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'grid', placeItems: 'center', zIndex: 100, padding: 16,
        }}>
          <div className="card" style={{ width: 'min(480px, 100%)', padding: 24 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 8px' }}>Review Karya</h2>
            <p className="card-desc" style={{ marginBottom: 16 }}>{karya.title}</p>

            <div className="form">
              <div>
                <label>Feedback untuk Siswa</label>
                <textarea
                  className="input"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Tulis feedback konstruktif..."
                  rows={4}
                  style={{ resize: 'vertical', fontFamily: 'inherit' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 24 }}>
              <button
                className="button button-primary"
                onClick={() => { onSave(karya.id, feedback); setOpen(false); }}
                style={{ flex: 1 }}
              >
                Simpan Review
              </button>
              <button className="button" onClick={() => setOpen(false)}>Batal</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
