# CHEXO Karya (Portfolio) - Setup Guide

## ⚠️ Penting: Jalankan Migration Dulu!

Sebelum pakai fitur karya, **wajib jalankan migration SQL** untuk menambahkan kolom yang dibutuhkan.

Lihat file: `supabase/karya-migration.sql`

Jalankan di **Supabase SQL Editor** untuk menambahkan kolom:
- `content` (path file di Storage)
- `project_url` (link eksternal)
- `image_url` (URL thumbnail)
- `published`, `reviewed`, `teacher_feedback`
- `tech`, `type`, `updated_at`

Plus storage bucket `task-submissions` dan RLS policies.

---

## Pertimbangan Database

**Q: Kenapa tidak pakai Google Drive saja?**

**A: Supabase tetap yang terbaik untuk karya siswa karena:**

| Aspek | Supabase | Google Drive |
|-------|----------|--------------|
| Query/filter | ✅ SQL penuh | ❌ Tidak ada |
| Relasi data | ✅ Foreign key | ❌ Tidak bisa |
| RLS security | ✅ Built-in | ⚠️ Perlu OAuth setup |
| API sederhana | ✅ REST/JS client | ❌ OAuth flow rumit |
| Metadata | ✅ Tabel terstruktur | ⚠️ Custom properties |
| Thumbnail | ✅ Image transform | ⚠️ Perlu manual |
| Realtime | ✅ Built-in | ❌ Tidak ada |
| **Storage file besar** | ✅ 1GB free | ✅ 15GB free |

**Strategi Hybrid (Recommended):**
- **Tabel `karya`** di Supabase → metadata (judul, deskripsi, URL, thumbnail)
- **Supabase Storage** → thumbnail & preview gambar (max 5MB)
- **Google Drive link** → file project besar (.zip, .apk, video demo)
- Field `project_url` di karya → link Google Drive

Dengan cara ini:
- Database tetap ringan (cuma text + URL)
- File besar tidak membebani Supabase
- Siswa bisa share project file via Drive publik

---

## Setup Storage Bucket

Jalankan SQL ini di **Supabase SQL Editor**:

```sql
-- 1. Buat bucket untuk karya (jika belum ada)
insert into storage.buckets (id, name, public)
values ('task-submissions', 'task-submissions', true)
on conflict (id) do nothing;

-- 2. Policy: Siswa bisa upload ke folder dengan user ID-nya sendiri
create policy "students upload own karya"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'task-submissions'
  and (storage.foldername(name))[1] = 'karya'
  and (storage.foldername(name))[2] = auth.uid()::text
);

-- 3. Policy: Semua orang authenticated bisa baca karya (untuk gallery)
create policy "authenticated read karya files"
on storage.objects for select
to authenticated
using (bucket_id = 'task-submissions');

-- 4. Policy: Siswa bisa hapus file miliknya
create policy "students delete own karya files"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'task-submissions'
  and (storage.foldername(name))[2] = auth.uid()::text
);
```

---

## Struktur Tabel `karya`

```sql
create table public.karya (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  content text,           -- Path file di Storage (opsional)
  project_url text,       -- Link eksternal (GitHub, Drive, dll)
  image_url text,         -- URL thumbnail
  published boolean not null default true,
  reviewed boolean not null default false,
  teacher_feedback text,
  created_at timestamptz not null default now()
);
```

Sudah ada di `supabase/admin-setup.sql`.

---

## Cara Pakai

### Siswa Upload Karya
1. Login sebagai siswa
2. Buka `/karya`
3. Klik **Upload Karya**
4. Isi judul, deskripsi
5. (Opsional) Masukkan link GitHub/Drive untuk project
6. (Opsional) Upload thumbnail/preview gambar
7. Klik **Upload**

### Guru Review Karya
1. Login sebagai guru
2. Buka `/karya`
3. Lihat semua karya siswa
4. Klik **Beri Review** pada karya tertentu
5. Tulis feedback
6. Klik **Simpan Review**

---

## Limit & Best Practice

| Item | Limit | Tips |
|------|-------|------|
| File upload | 5 MB | Compress gambar sebelum upload |
| Judul | 100 char | Singkat & jelas |
| Deskripsi | 500 char | Ringkas tapi informatif |
| Project URL | - | Gunakan GitHub/Drive publik |

---

## Troubleshooting

### Error: "Bucket not found"
- Pastikan bucket `task-submissions` sudah dibuat
- Cek di **Supabase Dashboard** → **Storage**

### Error: "new row violates row-level security policy"
- Pastikan policy RLS untuk storage sudah dijalankan
- Cek user sudah login

### File tidak muncul di gallery
- Cek policy SELECT untuk storage
- Pastikan `bucket.public = true` atau policy SELECT sudah dibuat

### Upload gagal dengan "Payload too large"
- File lebih dari 5 MB
- Compress atau gunakan link Google Drive saja
