-- CHEXO Admin Setup & Additional Tables
-- Jalankan script ini SETELAH schema.sql berhasil
-- Script ini menggunakan SECURITY DEFINER functions untuk menghindari infinite recursion di RLS

-- ============================================
-- 1. TABEL CLASSES (Manajemen Kelas)
-- ============================================
create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  grade text not null,
  homeroom_teacher uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

-- Add class_id to profiles if not exists
alter table public.profiles add column if not exists class_id uuid references public.classes(id);
alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists nis text;
alter table public.profiles add column if not exists nip text;

-- ============================================
-- 2. TABEL KARYA (Portofolio Karya Siswa)
-- ============================================
create table if not exists public.karya (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  type text not null,
  description text,
  url text,
  thumbnail_url text,
  tech text,
  created_at timestamptz not null default now()
);

-- ============================================
-- 3. TABEL SUBMISSIONS (Pengumpulan Tugas)
-- ============================================
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
  status text not null default 'menunggu' check (status in ('menunggu','dinilai')),
  grade integer,
  unique(assignment_id, student_id)
);

-- ============================================
-- 4. TABEL ASSIGNMENT_CLASSES (Relasi Tugas ke Kelas)
-- ============================================
create table if not exists public.assignment_classes (
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  primary key (assignment_id, class_id)
);

-- ============================================
-- 5. SECURITY DEFINER FUNCTIONS (menghindari infinite recursion)
-- ============================================
-- Fungsi ini berjalan dengan hak akses owner (bypass RLS)
-- sehingga bisa cek role tanpa trigger recursion

create or replace function public.current_user_role()
returns text
language sql
security definer
set search_path = public
stable
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'administrator'
  );
$$;

create or replace function public.is_guru_or_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role in ('guru', 'administrator')
  );
$$;

-- ============================================
-- 6. RLS POLICIES - PROFILES
-- ============================================
alter table public.profiles enable row level security;

drop policy if exists "users read own profile" on public.profiles;
create policy "users read own profile"
on public.profiles for select
to authenticated
using (id = auth.uid());

drop policy if exists "admins read all profiles" on public.profiles;
create policy "admins read all profiles"
on public.profiles for select
to authenticated
using (public.is_admin());

drop policy if exists "admins insert profiles" on public.profiles;
create policy "admins insert profiles"
on public.profiles for insert
to authenticated
with check (public.is_admin());

drop policy if exists "admins update profiles" on public.profiles;
create policy "admins update profiles"
on public.profiles for update
to authenticated
using (public.is_admin());

drop policy if exists "admins delete profiles" on public.profiles;
create policy "admins delete profiles"
on public.profiles for delete
to authenticated
using (public.is_admin());

-- ============================================
-- 7. RLS POLICIES - CLASSES
-- ============================================
alter table public.classes enable row level security;

drop policy if exists "everyone reads classes" on public.classes;
create policy "everyone reads classes"
on public.classes for select
to authenticated
using (true);

drop policy if exists "admins manage classes" on public.classes;
create policy "admins manage classes"
on public.classes for all
to authenticated
using (public.is_admin());

-- ============================================
-- 8. RLS POLICIES - KARYA
-- ============================================
alter table public.karya enable row level security;

drop policy if exists "students manage own karya" on public.karya;
create policy "students manage own karya"
on public.karya for all
to authenticated
using (student_id = auth.uid())
with check (student_id = auth.uid());

drop policy if exists "gurus and admins read all karya" on public.karya;
create policy "gurus and admins read all karya"
on public.karya for select
to authenticated
using (public.is_guru_or_admin());

-- ============================================
-- 9. RLS POLICIES - ASSIGNMENTS
-- ============================================
alter table public.assignments enable row level security;

drop policy if exists "students read published assignments" on public.assignments;
create policy "students read published assignments"
on public.assignments for select
to authenticated
using (published = true OR public.is_guru_or_admin());

drop policy if exists "gurus manage assignments" on public.assignments;
create policy "gurus manage assignments"
on public.assignments for all
to authenticated
using (public.is_guru_or_admin());

-- ============================================
-- 10. RLS POLICIES - SUBMISSIONS
-- ============================================
alter table public.submissions enable row level security;

drop policy if exists "students manage own submissions" on public.submissions;
create policy "students manage own submissions"
on public.submissions for all
to authenticated
using (student_id = auth.uid())
with check (student_id = auth.uid());

drop policy if exists "gurus read all submissions" on public.submissions;
create policy "gurus read all submissions"
on public.submissions for select
to authenticated
using (public.is_guru_or_admin());

drop policy if exists "gurus update submissions" on public.submissions;
create policy "gurus update submissions"
on public.submissions for update
to authenticated
using (public.is_guru_or_admin());

-- ============================================
-- 11. RLS POLICIES - MATERIALS
-- ============================================
drop policy if exists "gurus manage materials" on public.materials;
create policy "gurus manage materials"
on public.materials for all
to authenticated
using (public.is_guru_or_admin());

drop policy if exists "gurus manage material_assets" on public.material_assets;
create policy "gurus manage material_assets"
on public.material_assets for all
to authenticated
using (public.is_guru_or_admin());

-- ============================================
-- 12. RLS POLICIES - QUIZ
-- ============================================
alter table public.quizzes enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.quiz_attempts enable row level security;

drop policy if exists "students read published quizzes" on public.quizzes;
create policy "students read published quizzes"
on public.quizzes for select
to authenticated
using (published = true OR public.is_guru_or_admin());

drop policy if exists "gurus manage quizzes" on public.quizzes;
create policy "gurus manage quizzes"
on public.quizzes for all
to authenticated
using (public.is_guru_or_admin());

drop policy if exists "gurus manage quiz_questions" on public.quiz_questions;
create policy "gurus manage quiz_questions"
on public.quiz_questions for all
to authenticated
using (public.is_guru_or_admin());

drop policy if exists "students manage own quiz_attempts" on public.quiz_attempts;
create policy "students manage own quiz_attempts"
on public.quiz_attempts for all
to authenticated
using (student_id = auth.uid())
with check (student_id = auth.uid());

drop policy if exists "gurus read quiz_attempts" on public.quiz_attempts;
create policy "gurus read quiz_attempts"
on public.quiz_attempts for select
to authenticated
using (public.is_guru_or_admin());

-- ============================================
-- 13. RLS POLICIES - PLAYGROUND & PORTFOLIO
-- ============================================
alter table public.playground_projects enable row level security;
alter table public.portfolio_projects enable row level security;

drop policy if exists "students manage own playground" on public.playground_projects;
create policy "students manage own playground"
on public.playground_projects for all
to authenticated
using (student_id = auth.uid())
with check (student_id = auth.uid());

drop policy if exists "students manage own portfolio" on public.portfolio_projects;
create policy "students manage own portfolio"
on public.portfolio_projects for all
to authenticated
using (student_id = auth.uid())
with check (student_id = auth.uid());

drop policy if exists "gurus read playground" on public.playground_projects;
create policy "gurus read playground"
on public.playground_projects for select
to authenticated
using (public.is_guru_or_admin());

drop policy if exists "gurus read portfolio" on public.portfolio_projects;
create policy "gurus read portfolio"
on public.portfolio_projects for select
to authenticated
using (public.is_guru_or_admin());

-- ============================================
-- 14. SEED DATA - Contoh Kelas
-- ============================================
insert into public.classes (id, name, grade) values
('11111111-1111-1111-1111-111111111111', 'X-1', 'X'),
('22222222-2222-2222-2222-222222222222', 'X-2', 'X'),
('33333333-3333-3333-3333-333333333333', 'XI-1', 'XI'),
('44444444-4444-4444-4444-444444444444', 'XI-2', 'XI'),
('55555555-5555-5555-5555-555555555555', 'XII-1', 'XII'),
('66666666-6666-6666-6666-666666666666', 'XII-2', 'XII')
on conflict (id) do nothing;

-- ============================================
-- 15. INDEXES untuk Performance
-- ============================================
create index if not exists profiles_role_idx on public.profiles(role);
create index if not exists profiles_class_idx on public.profiles(class_id);
create index if not exists karya_student_idx on public.karya(student_id, created_at desc);
create index if not exists submissions_assignment_idx on public.submissions(assignment_id);
create index if not exists submissions_student_idx on public.submissions(student_id);
create index if not exists assignments_class_idx on public.assignments(class_name);
