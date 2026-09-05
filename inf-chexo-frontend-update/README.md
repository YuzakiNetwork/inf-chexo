# CHEXO

Platform pembelajaran Informatika untuk SMAN 1 Cicalengka.

## Stack
- Next.js
- React
- TypeScript
- Supabase

## Roles
- Student: `/siswa`
- Teacher: `/guru`
- Administrator: `/admin`

Role ditentukan oleh Supabase Auth + `profiles.role`, bukan pilihan pengguna di frontend.

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Isi `.env.local` dengan Supabase URL dan publishable/anon key.

## Database

Schema/migration terkait pembelajaran berada di `supabase/schema.sql`.

## Development

Repository utama CHEXO:
`YuzakiNetwork/inf-chexo`

Gunakan branch/commit yang jelas untuk setiap feature besar.
