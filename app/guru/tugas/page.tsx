'use client';

import { useEffect, useState } from 'react';
import { Shell } from '@/components/shell';
import { RoleGuard } from '@/components/role-guard';
import { getSupabaseBrowserClient } from '@/lib/supabase';

// File lampiran besar (>10 MB) sebaiknya pakai link (Google Drive / GitHub) saja.
const MAX_FILE_SIZE = 10 * 1024 * 1024;

type Assignment = {
  id: string;
  class_id: string | null;
  title: string;
  description: string | null;
  deadline: string | null;
  teacher_id: string | null;
  attachment_url: string | null;
};

type ClassRow = { id: string; name: string };

const emptyForm = { title: '', description: '', deadline: '', class_id: '', link: '' };

export default function TeacherTasks() {
  const [items, setItems] = useState<Assignment[]>([]);
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState<File | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const sb = getSupabaseBrowserClient();
    if (!sb) return;
    const [{ data: a }, { data: c }] = await Promise.all([
      sb.from('assignments').select('id,class_id,title,description,deadline,teacher_id,attachment_url').order('deadline', { ascending: true }),
      sb.from('classes').select('id,name').order('name'),
    ]);
    setItems((a || []) as Assignment[]);
    setClasses((c || []) as ClassRow[]);
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const save = async () => {
    const sb = getSupabaseBrowserClient();
    if (!sb) return;
    setSaving(true);
    setError('');

    const { data: { user } } = await sb.auth.getUser();
    if (!user) {
      setError('Sesi login tidak ditemukan.');
      setSaving(false);
      return;
    }

    let attachment_url = form.link.trim() || null;

    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        setError('File maksimal 10 MB. Untuk file lebih besar, gunakan kolom link (Google Drive / GitHub).');
        setSaving(false);
        return;
      }
      const path = `assignments/${user.id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await sb.storage.from('task-submissions').upload(path, file, { upsert: true });
      if (uploadError) {
        setError(uploadError.message);
        setSaving(false);
        return;
      }
      attachment_url = sb.storage.from('task-submissions').getPublicUrl(path).data.publicUrl;
    }

    const payload = {
      title: form.title.trim(),
      description: form.description || null,
      deadline: form.deadline ? new Date(form.deadline).toISOString() : null,
      class_id: form.class_id || null,
      teacher_id: user.id,
      attachment_url,
      published: true,
      updated_at: new Date().toISOString(),
    };

    const r = editing
      ? await sb.from('assignments').update(payload).eq('id', editing).select().single()
      : await sb.from('assignments').insert(payload).select().single();

    if (r.error) {
      setError(r.error.message);
    } else {
      await load();
      setForm(emptyForm);
      setFile(null);
      setEditing(null);
      setOpen(false);
    }
    setSaving(false);
  };

  const remove = async (id: string) => {
    if (!confirm('Hapus tugas ini?')) return;
    const sb = getSupabaseBrowserClient();
    if (!sb) return;
    const { error: e } = await sb.from('assignments').delete().eq('id', id);
    if (e) setError(e.message);
    else setItems((v) => v.filter((x) => x.id !== id));
  };

  return (
    <RoleGuard role={['guru', 'administrator']}>
      <Shell>
        <div className="container">
          <section className="page-head">
            <div className="eyebrow">Content management</div>
            <h1>Kelola tugas.</h1>
            <p>Buat, edit, atur deadline/kelas/lampiran, dan hapus tugas.</p>
          </section>

          <section className="section">
            <div className="section-head">
              <div>
                <div className="eyebrow">Assignments</div>
                <h2 className="section-title">{items.length} tugas</h2>
              </div>
              <button
                className="button button-dark"
                onClick={() => { setEditing(null); setForm(emptyForm); setFile(null); setOpen(true); }}
              >
                + Tugas baru
              </button>
            </div>

            {error && <div className="status status-red">{error}</div>}

            {open && (
              <div className="card" style={{ marginBottom: 18 }}>
                <div className="form">
                  <label>Judul tugas</label>
                  <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />

                  <label>Deskripsi</label>
                  <textarea className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

                  <div className="grid grid-2">
                    <div>
                      <label>Kelas</label>
                      <select className="input" value={form.class_id} onChange={(e) => setForm({ ...form, class_id: e.target.value })}>
                        <option value="">Semua/umum</option>
                        {classes.map((c) => <option value={c.id} key={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label>Deadline</label>
                      <input className="input" type="datetime-local" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
                    </div>
                  </div>

                  <label>Link lampiran (opsional)</label>
                  <input
                    className="input"
                    placeholder="https://drive.google.com/... atau link soal/referensi"
                    value={form.link}
                    onChange={(e) => setForm({ ...form, link: e.target.value })}
                  />

                  <label>Atau upload file lampiran (maks 10 MB — opsional)</label>
                  <input className="input" type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                  {file && <p className="muted" style={{ margin: 0 }}>Dipilih: {file.name} ({(file.size / 1024 / 1024).toFixed(1)} MB)</p>}
                  <p className="muted" style={{ margin: 0, fontSize: 12 }}>Kalau dua-duanya diisi, file yang diupload akan dipakai.</p>

                  <div>
                    <button className="button button-yellow" disabled={saving || !form.title.trim()} onClick={() => void save()}>
                      {saving ? 'Menyimpan...' : 'Simpan tugas'}
                    </button>{' '}
                    <button className="button" onClick={() => setOpen(false)}>Batal</button>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-2">
              {!loading && items.map((a) => (
                <article className="card" key={a.id}>
                  <span className="tag">{classes.find((c) => c.id === a.class_id)?.name || 'Umum'}</span>
                  <h3>{a.title}</h3>
                  <p>{a.description || 'Tidak ada deskripsi.'}</p>
                  <p className="muted">Deadline: {a.deadline ? new Date(a.deadline).toLocaleString('id-ID') : 'Tidak ditentukan'}</p>
                  {a.attachment_url && (
                    <p><a href={a.attachment_url} target="_blank" rel="noreferrer" className="card-link">Lihat lampiran <span className="icon" style={{ fontSize: 16 }}>arrow_forward</span></a></p>
                  )}
                  <div className="toolbar">
                    <button
                      className="button"
                      onClick={() => {
                        setEditing(a.id);
                        setForm({
                          title: a.title,
                          description: a.description || '',
                          deadline: a.deadline ? new Date(a.deadline).toISOString().slice(0, 16) : '',
                          class_id: a.class_id || '',
                          link: a.attachment_url || '',
                        });
                        setFile(null);
                        setOpen(true);
                      }}
                    >
                      Edit
                    </button>
                    <button className="button" onClick={() => void remove(a.id)}>Hapus</button>
                  </div>
                </article>
              ))}
            </div>
            {!loading && !items.length && <div className="card">Belum ada tugas.</div>}
          </section>
        </div>
      </Shell>
    </RoleGuard>
  );
}
