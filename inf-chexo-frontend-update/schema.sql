-- CHEXO v3.1.1 — Supabase learning content + progress

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nama text,
  role text not null default 'siswa' check (role in ('siswa','guru','administrator')),
  kelas text,
  created_at timestamptz not null default now()
);

create table if not exists public.materials (
  id uuid primary key default gen_random_uuid(),
  slug text,
  title text not null,
  description text,
  element text not null,
  content text,
  tag text,
  type text default 'Materi inti',
  duration text,
  objectives jsonb not null default '[]'::jsonb,
  published boolean not null default false,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.materials add column if not exists slug text;
alter table public.materials add column if not exists tag text;
alter table public.materials add column if not exists type text default 'Materi inti';
alter table public.materials add column if not exists duration text;
alter table public.materials add column if not exists objectives jsonb not null default '[]'::jsonb;

create unique index if not exists materials_slug_uidx on public.materials(slug);

create table if not exists public.material_assets (
  id uuid primary key default gen_random_uuid(),
  material_id uuid not null references public.materials(id) on delete cascade,
  type text not null check (type in ('pdf','video','link','file','embed')),
  title text,
  url text not null,
  meta text,
  created_at timestamptz not null default now()
);

alter table public.material_assets add column if not exists meta text;

create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  subject text,
  class_name text,
  deadline timestamptz not null,
  max_score integer not null default 100,
  published boolean not null default false,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  file_url text,
  file_name text,
  note text,
  submitted_at timestamptz not null default now(),
  score integer,
  teacher_comment text,
  status text not null default 'menunggu' check (status in ('menunggu','dinilai'))
);

create table if not exists public.quizzes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  published boolean not null default false,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  question text not null,
  options jsonb not null,
  correct_index integer not null,
  created_at timestamptz not null default now()
);

create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  score integer not null default 0,
  answers jsonb,
  started_at timestamptz not null default now(),
  finished_at timestamptz
);

create table if not exists public.playground_projects (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  html text not null default '',
  css text not null default '',
  javascript text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.portfolio_projects (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  type text not null,
  description text,
  url text,
  thumbnail_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.learning_progress (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  material_id uuid not null references public.materials(id) on delete cascade,
  progress integer not null default 0 check (progress between 0 and 100),
  updated_at timestamptz not null default now(),
  unique(student_id, material_id)
);

create index if not exists materials_published_idx on public.materials(published, created_at desc);
create index if not exists material_assets_material_idx on public.material_assets(material_id, created_at);
create index if not exists learning_progress_student_idx on public.learning_progress(student_id, updated_at desc);

-- Automatically create a student profile when an Auth account is registered.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, nama, kelas)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nama', split_part(coalesce(new.email, 'Siswa CHEXO'), '@', 1)),
    new.raw_user_meta_data ->> 'kelas'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- RLS: public may read published learning materials only.
alter table public.materials enable row level security;
alter table public.material_assets enable row level security;
alter table public.learning_progress enable row level security;
alter table public.profiles enable row level security;

drop policy if exists "published materials are readable" on public.materials;
create policy "published materials are readable"
on public.materials for select
to anon, authenticated
using (published = true);

drop policy if exists "assets of published materials are readable" on public.material_assets;
create policy "assets of published materials are readable"
on public.material_assets for select
to anon, authenticated
using (exists (
  select 1 from public.materials m
  where m.id = material_assets.material_id and m.published = true
));

drop policy if exists "students read own progress" on public.learning_progress;
create policy "students read own progress"
on public.learning_progress for select
to authenticated
using (student_id = auth.uid());

drop policy if exists "students insert own progress" on public.learning_progress;
create policy "students insert own progress"
on public.learning_progress for insert
to authenticated
with check (student_id = auth.uid());

drop policy if exists "students update own progress" on public.learning_progress;
create policy "students update own progress"
on public.learning_progress for update
to authenticated
using (student_id = auth.uid())
with check (student_id = auth.uid());

drop policy if exists "students delete own progress" on public.learning_progress;
create policy "students delete own progress"
on public.learning_progress for delete
to authenticated
using (student_id = auth.uid());

drop policy if exists "users read own profile" on public.profiles;
create policy "users read own profile"
on public.profiles for select
to authenticated
using (id = auth.uid());

-- Seed/update the eight CHEXO materials. Replace URLs with real school files later.
insert into public.materials (id, slug, title, description, element, content, tag, type, duration, objectives, published)
values
('258ce205-7c02-58f6-a205-a6b8412b72e3','bk','Berpikir Komputasional','Memecahkan masalah dengan dekomposisi, pola, abstraksi, dan algoritma.','Berpikir Komputasional','Berpikir komputasional adalah cara menyelesaikan masalah secara sistematis dengan konsep yang dapat diterapkan manusia maupun komputer.\n\nEmpat pola yang sering digunakan adalah dekomposisi, pengenalan pola, abstraksi, dan penyusunan algoritma.\n\nMulailah dari masalah nyata, pecah menjadi bagian kecil, tentukan informasi yang penting, lalu susun langkah penyelesaian yang dapat diuji.','Dasar','Materi inti','35 menit','["Menjelaskan konsep berpikir komputasional.","Menggunakan dekomposisi dan abstraksi.","Menyusun langkah solusi yang terstruktur."]',true),
('b56fcd50-fb34-59cd-b90e-d2007538fad1','tik','Teknologi Informasi & Komunikasi','Memahami teknologi digital, komunikasi, informasi, dan etika penggunaannya.','Teknologi Informasi dan Komunikasi','Teknologi informasi membantu manusia mengumpulkan, memproses, menyimpan, dan menyebarkan informasi.\n\nPenggunaan teknologi juga membutuhkan literasi digital agar komunikasi tetap aman, efektif, dan bertanggung jawab.','Dasar','Materi inti','30 menit','["Mengenali fungsi teknologi informasi.","Menerapkan etika komunikasi digital.","Menilai informasi secara kritis."]',true),
('60fac1d6-63bf-5e76-bb70-eae07a0be4aa','komputer','Sistem Komputer','Mengenal hardware, software, sistem operasi, dan cara komputer bekerja.','Sistem Komputer','Sistem komputer terdiri dari perangkat keras, perangkat lunak, dan pengguna yang saling berinteraksi.\n\nCPU, memori, penyimpanan, dan perangkat input-output bekerja bersama untuk menjalankan instruksi.','Dasar','Materi inti','40 menit','["Membedakan hardware dan software.","Menjelaskan alur kerja komputer.","Mengenali fungsi komponen utama."]',true),
('ac60b8b3-9363-513b-b959-9d78beafa35d','jaringan','Jaringan Komputer & Internet','Belajar konsep jaringan, protokol, alamat IP, dan internet.','Jaringan Komputer dan Internet','Jaringan menghubungkan perangkat agar dapat bertukar data dan berbagi sumber daya.\n\nInternet bekerja menggunakan berbagai protokol, termasuk TCP/IP, untuk mengatur komunikasi antarperangkat.','Jaringan','Materi inti','45 menit','["Menjelaskan fungsi jaringan.","Mengenali alamat IP dan protokol.","Membedakan jaringan lokal dan internet."]',true),
('29aff42e-5639-54a5-a902-b6ac9f084da4','data','Analisis Data','Mengolah, membaca, memvisualisasikan, dan menarik kesimpulan dari data.','Analisis Data','Analisis data dimulai dari memahami pertanyaan, membersihkan data, menemukan pola, lalu menyajikan hasil secara jelas.\n\nVisualisasi yang tepat membantu pembaca memahami informasi tanpa harus membaca seluruh tabel mentah.','Data','Materi inti','40 menit','["Membaca dataset sederhana.","Memilih visualisasi yang sesuai.","Menarik kesimpulan berdasarkan data."]',true),
('ccca3e9e-4dbf-5160-be77-e129658f65a4','algo','Algoritma & Pemrograman','Menyusun algoritma dan mengubahnya menjadi program yang dapat dijalankan.','Algoritma dan Pemrograman','Program adalah instruksi yang ditulis dengan aturan tertentu agar komputer dapat menjalankan solusi.\n\nSebelum coding, tuliskan algoritma, tentukan input dan output, lalu uji solusi dengan beberapa contoh.','Coding','Materi inti','50 menit','["Menulis algoritma sederhana.","Mengenali variabel, kondisi, dan perulangan.","Mengubah algoritma menjadi JavaScript."]',true),
('627f46da-7739-5b7f-8772-3f3014d2ae74','dsi','Dampak Sosial Informatika','Membahas keamanan, privasi, etika, dan dampak teknologi terhadap masyarakat.','Dampak Sosial Informatika','Teknologi dapat membawa manfaat besar sekaligus risiko. Privasi, keamanan, jejak digital, dan etika perlu dipahami sejak dini.\n\nSetiap pengguna bertanggung jawab mempertimbangkan dampak dari tindakan digitalnya.','Etika','Materi inti','30 menit','["Memahami privasi dan jejak digital.","Mengenali risiko keamanan digital.","Membuat keputusan digital yang bertanggung jawab."]',true),
('7b785069-7aeb-53fc-b8de-2cd4f23cfd80','plb','Praktik Lintas Bidang','Menerapkan informatika untuk menghasilkan karya dan menyelesaikan masalah nyata.','Praktik Lintas Bidang','Praktik lintas bidang menggabungkan konsep informatika dengan kebutuhan nyata untuk menghasilkan karya.\n\nProject yang baik memiliki tujuan, pengguna, proses pengembangan, pengujian, dan dokumentasi.','Project','Materi inti','60 menit','["Merancang project sederhana.","Membagi pekerjaan menjadi tahapan.","Mendokumentasikan hasil karya."]',true)
on conflict (id) do update set
  title=excluded.title, slug=excluded.slug, description=excluded.description, element=excluded.element,
  content=excluded.content, tag=excluded.tag, type=excluded.type, duration=excluded.duration,
  objectives=excluded.objectives, published=excluded.published, updated_at=now();

-- Seed the current demo asset references without deleting teacher-created assets.
insert into public.material_assets (id, material_id, type, title, url, meta) values
('f1f7d08c-13c8-5d6c-9c4f-9d6f8c0c0001','258ce205-7c02-58f6-a205-a6b8412b72e3','pdf','Ringkasan Berpikir Komputasional','#','PDF · 1,2 MB'),
('f1f7d08c-13c8-5d6c-9c4f-9d6f8c0c0002','258ce205-7c02-58f6-a205-a6b8412b72e3','video','Pengenalan Berpikir Komputasional','#','Video · 08:42'),
('f1f7d08c-13c8-5d6c-9c4f-9d6f8c0c0003','b56fcd50-fb34-59cd-b90e-d2007538fad1','link','Sumber literasi digital','#','Link eksternal'),
('f1f7d08c-13c8-5d6c-9c4f-9d6f8c0c0004','60fac1d6-63bf-5e76-bb70-eae07a0be4aa','pdf','Modul Sistem Komputer','#','PDF · 2,4 MB'),
('f1f7d08c-13c8-5d6c-9c4f-9d6f8c0c0005','ac60b8b3-9363-513b-b959-9d78beafa35d','video','Cara kerja internet secara sederhana','#','Video · 11:20'),
('f1f7d08c-13c8-5d6c-9c4f-9d6f8c0c0006','ac60b8b3-9363-513b-b959-9d78beafa35d','link','Simulasi jaringan','#','Link · Praktik'),
('f1f7d08c-13c8-5d6c-9c4f-9d6f8c0c0007','29aff42e-5639-54a5-a902-b6ac9f084da4','file','Dataset latihan kelas','#','CSV · 18 KB'),
('f1f7d08c-13c8-5d6c-9c4f-9d6f8c0c0008','ccca3e9e-4dbf-5160-be77-e129658f65a4','video','JavaScript untuk pemula','#','Video · 14:05'),
('f1f7d08c-13c8-5d6c-9c4f-9d6f8c0c0009','ccca3e9e-4dbf-5160-be77-e129658f65a4','link','Buka CHEXO Playground','/playground','Praktik coding'),
('f1f7d08c-13c8-5d6c-9c4f-9d6f8c0c0010','627f46da-7739-5b7f-8772-3f3014d2ae74','pdf','Panduan keamanan digital','#','PDF · 900 KB'),
('f1f7d08c-13c8-5d6c-9c4f-9d6f8c0c0011','7b785069-7aeb-53fc-b8de-2cd4f23cfd80','link','Template project CHEXO','/portfolio','Panduan')
on conflict (id) do update set
  material_id=excluded.material_id, type=excluded.type, title=excluded.title, url=excluded.url, meta=excluded.meta;
