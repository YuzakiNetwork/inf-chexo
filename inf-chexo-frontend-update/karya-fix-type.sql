-- CHEXO Karya Fix - Kolom type nullable
-- Jalankan script ini di Supabase SQL Editor

-- ============================================
-- 1. Ubah kolom type jadi nullable dengan default
-- ============================================

-- Hapus NOT NULL constraint dari kolom type
alter table public.karya
alter column type drop not null;

-- Set default value untuk type
alter table public.karya
alter column type set default 'Lainnya';

-- Update existing rows yang punya type NULL
update public.karya
set type = 'Lainnya'
where type is null;

-- ============================================
-- 2. Verifikasi schema karya
-- ============================================
select column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'public'
  and table_name = 'karya'
order by ordinal_position;
