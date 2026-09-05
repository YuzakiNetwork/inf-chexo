# CHEXO Edge Functions Setup

Panduan deploy Edge Functions untuk fitur admin (create/list/manage user).

## Daftar Edge Functions

1. **`admin-create-user`** - Buat user baru (siswa/guru/admin)
2. **`admin-list-users`** - List semua user dengan email
3. **`admin-manage-user`** - Update atau delete user

## Cara Deploy

### Opsi A: Via Supabase CLI (Recommended)

```bash
# 1. Install Supabase CLI (jika belum)
npm install -g supabase

# 2. Login
supabase login

# 3. Link project (ganti PROJECT_REF dengan ref dari URL Supabase)
supabase link --project-ref ojhehjpzoxwmjpvwrdko

# 4. Deploy semua functions
supabase functions deploy admin-create-user
supabase functions deploy admin-list-users
supabase functions deploy admin-manage-user
```

### Opsi B: Via Dashboard (Manual)

1. Buka **Supabase Dashboard** → **Edge Functions**
2. Klik **Create a new function**
3. Buat 3 function dengan nama: `admin-create-user`, `admin-list-users`, `admin-manage-user`
4. Copy-paste isi file `index.ts` masing-masing function
5. Klik **Deploy**

## Environment Variables

Edge Functions ini membutuhkan environment variable berikut (biasanya auto-set oleh Supabase):
- `SUPABASE_URL` - URL project
- `SUPABASE_ANON_KEY` - Anon key
- `SUPABASE_SERVICE_ROLE_KEY` - **Service role key** (dari Dashboard → Settings → API)

Untuk set manual jika perlu:
```bash
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

## Cara Mendapatkan Service Role Key

1. Buka **Supabase Dashboard** → **Settings** → **API**
2. Di bagian **Project API keys**, cari **service_role** (secret)
3. Klik **Copy** 
4. ⚠️ **JANGAN** expose key ini ke browser/client. Hanya untuk server/edge function.

## Verifikasi Deploy

Setelah deploy, cek di:
- **Dashboard** → **Edge Functions** → pastikan 3 functions ada dengan status "Active"

## Testing

1. Login sebagai admin di website CHEXO
2. Buka `/admin/users`
3. Coba **Tambah User** baru
4. Seharusnya tidak ada error "Failed to send a request to the Edge Function"

## Troubleshooting

### Error: "Missing Authorization header"
- Pastikan user sudah login
- Cek token masih valid

### Error: "Forbidden: Hanya administrator"
- User yang login bukan admin
- Cek role di tabel `profiles`

### Error: "Gagal membuat akun di Auth"
- Email sudah terdaftar
- Password terlalu lemah (min 6 char)

### Function tidak muncul di Dashboard
- Tunggu 1-2 menit setelah deploy
- Refresh halaman
- Cek log di **Edge Functions** → klik function → **Logs**

## Struktur File

```
supabase/
├── functions/
│   ├── admin-create-user/
│   │   └── index.ts
│   ├── admin-list-users/
│   │   └── index.ts
│   └── admin-manage-user/
│       └── index.ts
├── schema.sql
└── admin-setup.sql
```
