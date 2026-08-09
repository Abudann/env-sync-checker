# PRD: env-sync-checker

**Versi:** 1.0
**Tanggal:** 7 Agustus 2026
**Author:** Abudan
**Status:** Draft — Ready for Development

---

## 1. Ringkasan Eksekutif

`env-sync-checker` adalah CLI tool berbasis Node.js + TypeScript yang membandingkan file `.env` dengan `.env.example` (atau file environment lainnya), lalu melaporkan ketidaksesuaian antar key-nya. Tool ini membantu developer menghindari bug klasik "environment variable hilang" yang baru ketahuan saat aplikasi sudah jalan (atau lebih parah, saat production deploy).

**Value proposition satu kalimat:** *"Jangan biarkan `.env.example` lo bohong ke kontributor project lo."*

---

## 2. Latar Belakang & Masalah

### 2.1 Masalah yang Diselesaikan
Dalam project dengan environment variables (hampir semua project Node.js, Laravel, Next.js modern), sangat umum terjadi:

- Developer menambah env var baru di `.env` lokal saat development, tapi lupa menambahkannya ke `.env.example`.
- Kontributor baru / anggota tim lain melakukan `git clone`, copy `.env.example` ke `.env`, lalu menjalankan aplikasi — dan mendapat error yang tidak jelas karena env var penting tidak ada.
- Tidak ada mekanisme otomatis untuk mendeteksi drift ini sebelum kode di-merge atau di-deploy.

### 2.2 Siapa yang Terdampak
- Developer solo yang meninggalkan project lama lalu kembali lagi (lupa env var apa saja yang dibutuhkan).
- Tim kecil (2-5 orang) tanpa proses onboarding environment yang formal.
- Maintainer open-source project yang ingin kontributor baru bisa langsung jalan tanpa banyak tanya di issue/Discord.

### 2.3 Mengapa Sekarang
Belum banyak tool ringan yang fokus spesifik di masalah ini. Solusi yang ada saat ini kebanyakan:
- Manual (baca kode satu-satu untuk cari `process.env.X`)
- Bagian dari tool besar yang terlalu berat untuk kebutuhan ini (butuh setup config kompleks)

---

## 3. Tujuan & Sasaran

### 3.1 Tujuan Produk
1. Memberi cara instan (tanpa setup rumit) untuk memvalidasi kesesuaian antara `.env` dan `.env.example`.
2. Bisa diintegrasikan ke CI/CD (GitHub Actions) agar PR otomatis gagal jika env tidak sinkron.
3. Menjadi package npm yang bisa dipasang di project apa pun (framework-agnostic).

### 3.2 Tujuan Personal (Portfolio)
1. Menghasilkan package npm publik pertama milik Abudan — sinyal kuat untuk recruiter bahwa Abudan paham developer tooling, bukan hanya membangun aplikasi CRUD.
2. Project dengan scope kecil yang bisa benar-benar **selesai** dan dipakai di project lain (Jasaku, Ruang, portfolio) sebagai bukti nyata.
3. Menunjukkan pemahaman CI/CD melalui GitHub Action siap pakai.

### 3.3 Non-Tujuan (Out of Scope untuk v1)
- Tidak memvalidasi **value** dari env var (misal format URL valid atau tidak) — hanya membandingkan **keberadaan key**.
- Tidak menyimpan atau mengirim isi `.env` ke mana pun (privasi & keamanan).
- Tidak mendukung enkripsi/dekripsi env (bukan pengganti tools seperti Doppler/Vault).
- Tidak ada GUI/dashboard di v1 — CLI-only.

---

## 4. User Persona

| Persona | Deskripsi | Kebutuhan |
|---|---|---|
| **Solo Developer** | Punya banyak side-project, sering tinggalkan project lalu balik lagi | Cepat tahu env var apa yang hilang tanpa baca ulang kode |
| **Tech Lead / Maintainer** | Mengelola repo dengan beberapa kontributor | Cegah PR masuk yang bikin `.env.example` basi |
| **Kontributor Open Source** | Baru clone repo, ingin cepat jalan | `.env.example` yang bisa dipercaya 100% lengkap |

---

## 5. Fitur & Requirement

### 5.1 MVP (v1.0) — Prioritas Utama

| ID | Fitur | Deskripsi | Prioritas |
|---|---|---|---|
| F1 | **Parse .env files** | Baca file `.env` dan `.env.example`, ekstrak semua key (bukan value, demi keamanan) | Must Have |
| F2 | **Compare keys** | Bandingkan dua set key, hasilkan 3 kategori: hilang di example, hilang di env, sinkron | Must Have |
| F3 | **Terminal output berwarna** | Tampilkan hasil dengan format jelas (❌ ⚠️ ✅) menggunakan warna terminal | Must Have |
| F4 | **Exit code untuk CI** | Exit code `1` jika ada mismatch, `0` jika sinkron — agar bisa dipakai di CI pipeline | Must Have |
| F5 | **Custom file path via flag** | User bisa tentukan path file custom, misal `--env .env.staging` | Must Have |
| F6 | **Help & version command** | `--help` dan `--version` standar CLI | Must Have |

### 5.2 Fase 2 (v1.1 — Setelah MVP Stabil)

| ID | Fitur | Deskripsi | Prioritas |
|---|---|---|---|
| F7 | **Auto-fix mode** | Flag `--fix` yang otomatis menambahkan key yang kurang ke `.env.example` dengan value kosong | Should Have |
| F8 | **Config file (`.envsyncrc`)** | Exclude key tertentu yang sengaja berbeda (misal `NODE_ENV`, `PORT`) | Should Have |
| F9 | **Multi-file comparison** | Support banding lebih dari 2 file sekaligus (`.env.local`, `.env.production`, dll) | Could Have |
| F10 | **JSON output mode** | Flag `--json` untuk output machine-readable (integrasi dengan tool lain) | Could Have |

### 5.3 Fase 3 (v2.0 — Ekspansi)

| ID | Fitur | Deskripsi | Prioritas |
|---|---|---|---|
| F11 | **Pre-made GitHub Action** | `action.yml` siap pakai, tinggal reference di workflow tanpa install manual | Should Have |
| F12 | **Pre-commit hook helper** | Integrasi dengan Husky untuk cek otomatis sebelum commit | Could Have |
| F13 | **Scan source code untuk key terpakai** | Deteksi `process.env.X` di source code yang tidak ada di `.env` sama sekali | Won't Have (v2) |

---

## 6. User Flow

### 6.1 Basic Usage
```bash
npx env-sync-checker
```
1. Tool otomatis cari `.env` dan `.env.example` di root directory.
2. Parse kedua file, ekstrak key.
3. Tampilkan laporan di terminal.
4. Exit dengan code sesuai hasil (0 = OK, 1 = ada masalah).

### 6.2 Custom Path
```bash
npx env-sync-checker --env .env.staging --example .env.example
```

### 6.3 CI/CD Integration
```yaml
# .github/workflows/env-check.yml
- name: Check env sync
  run: npx env-sync-checker
```
Jika key tidak sinkron → workflow gagal → PR tidak bisa merge sampai diperbaiki.

### 6.4 Auto-fix
```bash
npx env-sync-checker --fix
```
Otomatis menambahkan key yang hilang ke `.env.example` dengan value kosong (`KEY_NAME=`).

---

## 7. Contoh Output

```
$ npx env-sync-checker

🔍 Comparing .env ↔ .env.example

❌ Missing in .env.example (2):
   - STRIPE_API_KEY
   - REDIS_URL

⚠️  Missing in .env (1):
   - DEBUG_MODE

✅ In sync (8 keys)

Summary: 2 issues found. Run with --fix to auto-resolve.
```

```
$ npx env-sync-checker

✅ All 11 keys are in sync between .env and .env.example
```

---

## 8. Spesifikasi Teknis

### 8.1 Tech Stack
| Layer | Teknologi | Alasan |
|---|---|---|
| Runtime | Node.js (LTS) | Sesuai stack yang sudah dikuasai |
| Bahasa | TypeScript | Type safety, DX lebih baik untuk maintain |
| CLI Framework | Commander.js | Ringan, populer, dokumentasi jelas |
| Terminal styling | Chalk / Picocolors | Output berwarna, readable |
| Testing | Vitest / Jest | Unit test untuk parser & comparator |
| Build | tsup / esbuild | Bundle CLI jadi single file, cepat |
| Distribusi | npm registry | `npx env-sync-checker` tanpa install global |

### 8.2 Struktur Project
```
env-sync-checker/
├── src/
│   ├── parser.ts        # Parse .env file → Map<key, value>
│   ├── compare.ts        # Logic bandingin dua set key
│   ├── reporter.ts       # Format output (warna, simbol, exit code)
│   ├── cli.ts             # Entry point, handle flags
│   └── config.ts          # Baca .envsyncrc (fase 2)
├── tests/
│   ├── parser.test.ts
│   └── compare.test.ts
├── bin/
│   └── env-sync-checker.js  # Executable entry
├── action.yml               # GitHub Action definition (fase 3)
├── package.json
├── tsconfig.json
└── README.md
```

### 8.3 Algoritma Inti (Compare Logic)
```
1. parseEnvFile(path) → mengembalikan Set<string> berisi nama key
2. keysEnv = parseEnvFile('.env')
3. keysExample = parseEnvFile('.env.example')
4. missingInExample = keysEnv - keysExample
5. missingInEnv = keysExample - keysEnv
6. inSync = keysEnv ∩ keysExample
7. jika (missingInExample.size > 0 || missingInEnv.size > 0):
     exitCode = 1
   else:
     exitCode = 0
```

### 8.4 Pertimbangan Keamanan
- **Tidak pernah membaca atau menampilkan value** dari `.env`, hanya nama key — mencegah kebocoran secret secara tidak sengaja (misal ke log CI publik).
- Tidak melakukan network request apa pun — 100% berjalan lokal.

---

## 9. Metrik Keberhasilan

| Metrik | Target |
|---|---|
| Waktu eksekusi | < 1 detik untuk file `.env` ukuran normal (<100 keys) |
| Package published ke npm | Ya, dengan README lengkap |
| Terpasang di minimal 1 project sendiri | Jasaku / Ruang / Portfolio sebagai dogfooding |
| GitHub stars (opsional, bonus) | Tidak jadi tolok ukur utama — fokus ke kualitas & kegunaan, bukan popularitas |

---

## 10. Roadmap & Milestone

| Milestone | Cakupan | Estimasi |
|---|---|---|
| **M1: Core Logic** | F1, F2 — parser & comparator + unit test | 1 hari |
| **M2: CLI Interface** | F3, F4, F5, F6 — CLI lengkap dengan output rapi | 1 hari |
| **M3: Publish v1.0** | Setup package.json, README, publish ke npm | 0.5 hari |
| **M4: Auto-fix & Config** | F7, F8 | 1 hari |
| **M5: GitHub Action** | F11 — action.yml siap pakai | 0.5 hari |

**Total estimasi MVP (M1-M3): ~2.5 hari kerja**

---

## 11. Risiko & Mitigasi

| Risiko | Mitigasi |
|---|---|
| Parsing `.env` yang punya format tidak standar (multiline value, quote, komentar) | Gunakan library battle-tested seperti `dotenv` untuk parsing dasar, jangan reinvent parser dari nol |
| Nama package sudah dipakai orang lain di npm | Cek ketersediaan nama sebelum mulai coding; siapkan 2-3 alternatif nama |
| Adopsi rendah karena tool niche | Tetap valuable sebagai portfolio piece + dogfooding di project sendiri, walau tidak viral |

---

## 12. Pertanyaan Terbuka (Perlu Diputuskan Sebelum Dev)

1. Nama package final: `env-sync-checker`, `env-sync`, atau nama lain yang belum dipakai di npm?
2. Lisensi: MIT (rekomendasi untuk tool open-source kecil)?
3. Apakah v1.0 langsung include GitHub Action, atau ditunda ke fase 3 sesuai roadmap di atas?

---

## 13. Lampiran: Contoh README (Draft Kasar)

```markdown
# env-sync-checker

Compare your `.env` and `.env.example` files and catch missing keys before they break someone else's setup.

## Install
npx env-sync-checker

## Usage
npx env-sync-checker --env .env --example .env.example

## CI/CD
Add to your GitHub Actions workflow to block PRs with out-of-sync env files.
```
