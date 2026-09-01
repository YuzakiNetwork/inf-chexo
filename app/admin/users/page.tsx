'use client';

import { useEffect, useState } from 'react';
import { Shell } from '@/components/shell';
import { RoleGuard } from '@/components/role-guard';
import { BackButton } from '@/components/back-button';
import { getSupabaseBrowserClient } from '@/lib/supabase';

type UserRow = {
  id: string;
  full_name: string | null;
  role: string;
  class_id: string | null;
  email?: string;
};

type ClassRow = { id: string; name: string };

type FormState = {
  full_name: string;
  email: string;
  password: string;
  role: 'siswa' | 'guru' | 'administrator';
  class_id: string;
};

export default function AdminUsers() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [form, setForm] = useState<FormState>({
    full_name: '', email: '', password: '', role: 'siswa', class_id: '',
  });
  const [edit, setEdit] = useState<UserRow | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    const sb = getSupabaseBrowserClient();
    if (!sb) return;
    const [{ data: c }, { data: u, error: e }] = await Promise.all([
      sb.from('classes').select('id, name').order('name'),
      sb.functions.invoke('admin-list-users'),
    ]);
    if (e || u?.error) setError(e?.message || u?.error || 'Gagal memuat pengguna');
    setClasses((c || []) as ClassRow[]);
    setUsers((u?.users || []) as UserRow[]);
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const create = async () => {
    const sb = getSupabaseBrowserClient();
    if (!sb) return;
    setSaving(true);
    setError('');
    const { data, error: e } = await sb.functions.invoke('admin-create-user', { body: form });
    if (e || data?.error) setError(e?.message || data?.error || 'Gagal membuat akun');
    else {
      setForm({ full_name: '', email: '', password: '', role: 'siswa', class_id: '' });
      setOpen(false);
      await load();
    }
    setSaving(false);
  };

  const update = async () => {
    if (!edit) return;
    const sb = getSupabaseBrowserClient();
    if (!sb) return;
    setSaving(true);
    setError('');
    const { data, error: e } = await sb.functions.invoke('admin-manage-user', {
      body: {
        action: 'update',
        user_id: edit.id,
        full_name: form.full_name,
        role: form.role,
        class_id: form.class_id,
        password: form.password || undefined,
      },
    });
    if (e || data?.error) setError(e?.message || data?.error || 'Gagal memperbarui akun');
    else {
      setEdit(null);
      setOpen(false);
      await load();
    }
    setSaving(false);
  };

  const remove = async (id: string) => {
    if (!confirm('Hapus akun ini dari Auth dan profiles?')) return;
    const sb = getSupabaseBrowserClient();
    if (!sb) return;
    const { data, error: e } = await sb.functions.invoke('admin-manage-user', {
      body: { action: 'delete', user_id: id },
    });
    if (e || data?.error) setError(e?.message || data?.error || 'Gagal menghapus akun');
    else await load();
  };

  const openCreate = () => {
    setEdit(null);
    setForm({ full_name: '', email: '', password: '', role: 'siswa', class_id: '' });
    setOpen(true);
  };

  const openEdit = (u: UserRow) => {
    setEdit(u);
    setForm({
      full_name: u.full_name || '',
      email: u.email || '',
      password: '',
      role: u.role as FormState['role'],
      class_id: u.class_id || '',
    });
    setOpen(true);
  };

  return (
    <RoleGuard role="administrator">
      <Shell>
        <div className="container">
          <div className="page-head">
            <BackButton href="/admin" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <span className="tag" style={{ marginBottom: 12 }}>Manajemen Pengguna</span>
                <h1>Kelola Akun</h1>
                <p>Tambah, edit, atau hapus akun siswa, guru, dan administrator.</p>
              </div>
              <button className="button button-primary" onClick={openCreate}>
                + Tambah User
              </button>
            </div>
          </div>

          {error && (
            <div className="card" style={{ marginBottom: 24, padding: 16, background: '#fef2f2', borderColor: '#fecaca' }}>
              <strong style={{ fontSize: 14, color: 'var(--danger)' }}>{error}</strong>
            </div>
          )}

          {/* Users List */}
          {loading ? (
            <div className="card" style={{ padding: 40, textAlign: 'center' }}>Memuat pengguna...</div>
          ) : users.length === 0 ? (
            <div className="card" style={{ padding: 40, textAlign: 'center' }}>
              <h3 className="card-title">Belum ada pengguna</h3>
              <p className="card-desc">Tambahkan user pertama dengan tombol di atas.</p>
            </div>
          ) : (
            <div className="grid">
              {users.map((u) => (
                <div key={u.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                  <div>
                    <h3 className="card-title">{u.full_name || 'Tanpa Nama'}</h3>
                    <p className="card-desc">{u.email || '—'}</p>
                    <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                      <span className="tag">{u.role}</span>
                      {u.class_id && <span className="tag">{classes.find(c => c.id === u.class_id)?.name || '—'}</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="button button-sm" onClick={() => openEdit(u)}>Edit</button>
                    <button className="button button-sm" onClick={() => remove(u.id)} style={{ color: 'var(--danger)' }}>Hapus</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Modal */}
          {open && (
            <div style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
              display: 'grid', placeItems: 'center', zIndex: 100, padding: 16,
            }}>
              <div className="card" style={{ width: 'min(480px, 100%)', padding: 24 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 16px' }}>
                  {edit ? 'Edit User' : 'Tambah User Baru'}
                </h2>

                <div className="form">
                  <div>
                    <label>Nama Lengkap</label>
                    <input
                      className="input"
                      value={form.full_name}
                      onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                      placeholder="Nama lengkap"
                    />
                  </div>

                  {!edit && (
                    <>
                      <div>
                        <label>Email</label>
                        <input
                          className="input"
                          type="email"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          placeholder="email@sekolah.sch.id"
                        />
                      </div>
                      <div>
                        <label>Password</label>
                        <input
                          className="input"
                          type="password"
                          value={form.password}
                          onChange={(e) => setForm({ ...form, password: e.target.value })}
                          placeholder="Minimal 6 karakter"
                        />
                      </div>
                    </>
                  )}

                  {edit && (
                    <div>
                      <label>Password Baru (kosongkan jika tidak diubah)</label>
                      <input
                        className="input"
                        type="password"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        placeholder="Minimal 6 karakter"
                      />
                    </div>
                  )}

                  <div>
                    <label>Role</label>
                    <select
                      className="input"
                      value={form.role}
                      onChange={(e) => setForm({ ...form, role: e.target.value as FormState['role'] })}
                    >
                      <option value="siswa">Siswa</option>
                      <option value="guru">Guru</option>
                      <option value="administrator">Administrator</option>
                    </select>
                  </div>

                  {form.role === 'siswa' && (
                    <div>
                      <label>Kelas</label>
                      <select
                        className="input"
                        value={form.class_id}
                        onChange={(e) => setForm({ ...form, class_id: e.target.value })}
                      >
                        <option value="">— Pilih Kelas —</option>
                        {classes.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {error && (
                  <div className="status status-danger" role="alert" style={{ marginTop: 16 }}>
                    {error}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 8, marginTop: 24 }}>
                  <button
                    className="button button-primary"
                    onClick={edit ? update : create}
                    disabled={saving}
                    style={{ flex: 1 }}
                  >
                    {saving ? 'Menyimpan...' : (edit ? 'Simpan Perubahan' : 'Buat Akun')}
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
