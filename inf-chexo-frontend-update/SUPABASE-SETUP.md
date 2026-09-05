# CHEXO — Supabase Setup

## 1. Environment

Copy `.env.example` to `.env.local` and fill:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 2. Database

Open Supabase → SQL Editor and run `supabase/schema.sql`.

The schema will:

- create/extend the `materials` table;
- seed the eight CHEXO learning materials;
- seed their PDF/video/link/file references;
- create `learning_progress` access rules;
- create a profile automatically after a new Auth user is registered;
- allow public visitors to read only published materials.

## 3. Auth

Enable Email/Password in Supabase Authentication.

Create a test student in Authentication → Users. The trigger creates a matching `profiles` row with role `siswa`.

## 4. Verify

1. Open `/materi` — published materials should come from Supabase.
2. Open a material — its asset list should come from `material_assets`.
3. Sign in — mark a material as complete.
4. Check `learning_progress` — a row should exist for the logged-in user.

If the public Supabase variables are missing, CHEXO intentionally falls back to its bundled demo materials so the UI remains usable during development.
