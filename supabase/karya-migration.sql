-- CHEXO Karya Migration
-- Menambahkan kolom yang dibutuhkan untuk fitur karya
-- Jalankan script ini di Supabase SQL Editor

-- ============================================
-- 1. ALTER TABEL KARYA - Tambah kolom yang missing
-- ============================================

-- Tambah kolom content (path file di Storage)
alter table public.karya
add column if not exists content text;

-- Tambah kolom project_url (link eksternal: GitHub, Drive, R2)
alter table public.karya
add column if not exists project_url text;

-- Tambah kolom image_url (URL thumbnail)
alter table public.karya
add column if not exists image_url text;

-- Tambah kolom published (apakah karya dipublikasi)
alter table public.karya
add column if not exists published boolean not null default true;

-- Tambah kolom reviewed (apakah sudah di-review guru)
alter table public.karya
add column if not exists reviewed boolean not null default false;

-- Tambah kolom teacher_feedback (feedback dari guru)
alter table public.karya
add column if not exists teacher_feedback text;

-- Tambah kolom tech (teknologi yang digunakan)
alter table public.karya
add column if not exists tech text;

-- Tambah kolom type (jenis karya)
alter table public.karya
add column if not exists type text;

-- Tambah updated_at untuk tracking
alter table public.karya
add column if not exists updated_at timestamptz not null default now();

-- ============================================
-- 2. INDEXES untuk performa
-- ============================================
create index if not exists karya_student_created_idx
on public.karya(student_id, created_at desc);

create index if not exists karya_published_idx
on public.karya(published, created_at desc)
where published = true;

-- ============================================
-- 3. TRIGGER untuk auto-update updated_at
-- ============================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists karya_set_updated_at on public.karya;
create trigger karya_set_updated_at
before update on public.karya
for each row execute procedure public.set_updated_at();

-- ============================================
-- 4. STORAGE BUCKET - Pastikan ada
-- ============================================
insert into storage.buckets (id, name, public)
values ('task-submissions', 'task-submissions', true)
on conflict (id) do nothing;

-- ============================================
-- 5. STORAGE POLICIES untuk karya
-- ============================================

-- Hapus policy lama jika ada
drop policy if exists "students upload own karya" on storage.objects;
drop policy if exists "authenticated read karya files" on storage.objects;
drop policy if exists "students delete own karya files" on storage.objects;
drop policy if exists "gurus manage karya files" on storage.objects;

-- Siswa bisa upload ke folder karya/{user_id}/
create policy "students upload own karya"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'task-submissions'
  and (storage.foldername(name))[1] = 'karya'
  and (storage.foldername(name))[2] = auth.uid()::text
);

-- Semua authenticated user bisa baca karya (untuk gallery)
create policy "authenticated read karya files"
on storage.objects for select
to authenticated
using (bucket_id = 'task-submissions');

-- Siswa bisa hapus file karyanya sendiri
create policy "students delete own karya files"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'task-submissions'
  and (storage.foldername(name))[1] = 'karya'
  and (storage.foldername(name))[2] = auth.uid()::text
);

-- Guru/Admin bisa hapus semua file karya (moderasi)
create policy "gurus manage karya files"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'task-submissions'
  and exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('guru', 'administrator')
  )
);

-- ============================================
-- 6. VERIFIKASI - Cek schema karya
-- ============================================
-- Query ini untuk memastikan semua kolom sudah ada
select column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'public'
  and table_name = 'karya'
order by ordinal_position;
