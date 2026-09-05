# CHEXO Storage Strategy

## Rekomendasi: Hybrid Storage

Untuk CHEXO (platform pembelajaran sekolah), gunakan strategi hybrid:

| Jenis File | Storage | Max Size | Alasan |
|------------|---------|----------|--------|
| Thumbnail/preview | **Supabase Storage** | 5 MB | Terintegrasi dengan database |
| File project kecil | **Supabase Storage** | 5 MB | ZIP source code kecil |
| File project besar | **Google Drive** link | Unlimited | Gratis 15 GB per akun |
| File project besar (alternatif) | **Cloudflare R2** | 10 GB free | Egress gratis unlimited |

---

## Cloudflare R2 vs Supabase Storage vs Google Drive

### Perbandingan Harga

| Provider | Storage Free | Egress/Bandwidth | Cocok Untuk |
|----------|--------------|------------------|-------------|
| **Supabase Storage** | 1 GB | 2 GB/bulan, lalu $0.09/GB | File kecil, metadata |
| **Cloudflare R2** | 10 GB/bulan | **GRATIS unlimited** | File besar, download banyak |
| **Google Drive** | 15 GB | Gratis via link sharing | File besar, sharing publik |

### Perbandingan Teknis

| Fitur | Supabase | R2 | Drive |
|-------|----------|-----|-------|
| API S3-compatible | ❌ Custom | ✅ Ya | ❌ OAuth |
| Public URL | ✅ Ya | ✅ Ya | ✅ Ya (via share) |
| Custom domain | ❌ | ✅ Ya | ❌ |
| CDN global | ⚠️ Basic | ✅ Built-in | ✅ Google CDN |
| Direct upload | ✅ | ✅ | ❌ |
| Access control | ✅ RLS | ⚠️ Token | ⚠️ Share settings |

---

## Setup Cloudflare R2 (Recommended untuk File Besar)

### Langkah 1: Buat Akun Cloudflare
1. Buka https://dash.cloudflare.com/sign-up
2. Verifikasi email

### Langkah 2: Aktifkan R2
1. Di dashboard, klik **R2** di sidebar
2. Klik **Purchase R2 Plan** (ada free tier, perlu kartu kredit untuk verifikasi)
3. Setelah aktif, klik **Create bucket**
4. Nama bucket: `chexo-karya`
5. Region: **Asia Pacific** (Singapore atau Jakarta)

### Langkah 3: Setup Public Access
1. Klik bucket `chexo-karya`
2. Tab **Settings**
3. Di **Public Access**, klik **Allow Access**
4. Copy **Public URL** (misal: `https://pub-xxx.r2.dev`)

### Langkah 4: Generate API Token
1. Klik **R2** → **Manage R2 API Tokens**
2. Klik **Create API Token**
3. Permissions: **Object Read & Write**
4. Specify bucket: `chexo-karya`
5. TTL: Sesuaikan
6. Klik **Create API Token**
7. **Copy Access Key ID dan Secret Access Key** (tidak akan muncul lagi!)

### Langkah 5: Upload File (Cara Manual)
Untuk siswa, upload via dashboard:
1. Buka bucket `chexo-karya`
2. Klik **Upload**
3. Drag & drop file
4. Setelah upload, klik file → copy **Public URL**

---

## Alur Upload Karya Siswa

### File Kecil (≤ 5 MB)
```
Siswa → Upload langsung di form karya → Supabase Storage → URL otomatis
```

### File Besar (> 5 MB)
```
Siswa → Upload ke Google Drive / R2 → Set "Anyone with link can view"
     → Copy public link
     → Paste di form karya kolom "Link Project"
     → Submit
```

---

## Environment Variables (untuk Admin Upload via R2)

Jika nanti mau integrasi R2 langsung (auto-upload), tambahkan di `.env.local`:

```bash
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=chexo-karya
R2_PUBLIC_URL=https://pub-xxx.r2.dev
```

Tapi untuk saat ini, **manual upload oleh siswa sudah cukup** untuk sekolah.

---

## Limit & Best Practice

### Supabase Storage (untuk file kecil)
- Max file: **5 MB** (sudah divalidasi di form karya)
- Tipe yang diizinkan: image, pdf, zip, apk, doc
- Path: `karya/{user_id}/{timestamp}-{filename}`

### Google Drive (untuk file besar)
- Set share: **Anyone with the link - Viewer**
- Hindari upload file > 100 MB ke Drive pribadi (limit harian)
- Untuk project > 100 MB, gunakan **R2** atau **GitHub Releases**

### Cloudflare R2 (alternatif)
- Free tier: 10 GB/bulan storage, **unlimited egress**
- Cocok untuk: video demo, file APK besar, dataset
- Bisa custom domain: `cdn.sekolah.sch.id`

---

## Troubleshooting

### "File terlalu besar" di form karya
- Maksimal 5 MB untuk upload langsung
- Untuk file lebih besar, pakai link Google Drive/R2

### Google Drive link tidak bisa diakses
- Pastikan setting share: **Anyone with link - Viewer**
- Test link di incognito/private browser

### R2 file tidak muncul
- Cek bucket sudah **Allow Public Access**
- URL harus dari `pub-xxx.r2.dev`, bukan endpoint internal

### R2 biaya membengkak
- Free tier 10 GB/bulan, operasi Class A (write) $4.50/juta, Class B (read) gratis
- Untuk sekolah dengan 100 siswa, free tier biasanya cukup
- Monitor di dashboard Cloudflare
