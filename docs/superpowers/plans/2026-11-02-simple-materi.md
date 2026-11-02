# Simple Materi Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sistem statis multi-guru: guru menulis MD di `guru/<nama>/md/`, PowerShell membangun & menayangkannya sebagai situs Next.js statis yang indah, di-host Firebase → `<nama>.manurhidma.my.id` + homepage sekolah `manurhidma.my.id`.

**Architecture:** Satu codebase Next.js (App Router, `output: 'export'`) yang dibaca kontennya dari filesystem saat build. Variabel `GURU=boy` memilih rak guru yang dibangun; `MODE=home` membangun homepage sekolah. Power Shell script mengemas (build-assets → next build → preview/deploy). Tanpa runtime server.

**Tech Stack:** Next.js (App Router, TypeScript, `'output: export'`), Tailwind CSS v4 + shadcn/ui (default theme), framer-motion (animasi + `useReducedMotion`), marked + gray-matter (MD → blocks), vitest (uji logika konten), PowerShell (build/deploy), Firebase Hosting multi-site.

**Spec:** `pamai.md` (di root repo) — intent, domain arsitektur, anti-goal. Plan ini bertumpu padanya.

## Global Constraints

- Static export: `next.config` memuat `output: 'export'` dan `images.unoptimized: true`. Tidak ada API route, SSR, server runtime.
- UI **mobile-first, enak dibaca di HP** — ukuran tipografi, spacing, dan urutan layout diputuskan untuk layar ponsel dulu.
- shadcn/ui pakai **default theme** (neutral), Tailwind v4.
- UI berbahasa Indonesia.
- `settings.json` guru: persis `namaGuru`, `mapel`, `judulSitus`, `deskripsi`, `temaWarna` (string, nama palet: `biru` default).
- MD sintaks: Markdown standar; gambar `![alt](gambar/nama.ext)`; video baris khusus `:::youtube <id>`; frontmatter opsional `judul`/`tanggal`/`ringkasan`.
- Materi **flat**: satu MD = satu pertemuan; urutan & slug dari nama file (`01-sistem-tata-surya.md` → slug `sistem-tata-surya`, urut leksikografis).
- Gambar disalin apa adanya — tidak ada resize saat build.
- Konten hanya dibaca dari `guru/<guru>/` — guru tanpa `settings.json` tetap bisa dibangun dengan default bawaan.
- Animasi wajib hormati `prefers-reduced-motion`.

## Review Focus

1. Nama file materi tanpa awalan angka atau huruf besar/kecil campur → urutan tetap stabil leksikografis dan slug harus aman-URL (huruf kecil + tanda hubung).
2. MD tanpa frontmatter → judul diambil dari heading `#` pertama, `ringkasan` dari paragraf pertama (trim 160 char); build tidak boleh gagal.
3. `:::youtube` kosong / id aneh (spasi, karakter sama-dengan, dsb.) → block dibuang, halaman tetap terbuild.
4. MD merujuk gambar yang tidak ada di `gambar/` → build tetap sukses; `src` tetap ditulis apa adanya (rencana `/gambar/...`), alt tetap tampil.
5. Folder `md/` kosong → halaman utama menampilkan empty-state (pesan ajakan menulis) dan build sukses.

---

### Task 1: Scaffold aplikasi Next.js statis (+ git init)

**Files:**
- Create: `.gitignore`, `package.json`, `next.config.ts`, `postcss.config.mjs`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `components.json` (via shadcn init)
- Test: build sukses + aset keluar di `out/`

**Interfaces:**
- Produces: aplikasi Next.js App Router dengan jalur `/` yang bisa dibangun statis; alias import `@/*`; repo git baru.

- [ ] **Step 1: git init + .gitignore (node_modules, .next, out, .env*)** dan commit `pamai.md` + folder `guru/` + plan ini.

- [ ] **Step 2: `npm init -y`, lalu install:** `next react react-dom framer-motion marked gray-matter` dan dev: `typescript @types/react @types/react-dom @types/node vitest tailwindcss @tailwindcss/postcss @tailwindcss/typography`.

- [ ] **Step 3: Tulis `next.config.ts`** dengan `output: 'export'`, `images.unoptimized: true`, `trailingSlash` default; `app/globals.css` pakai Tailwind v4 (`@import "tailwindcss";`) dan import plugin typography.

- [ ] **Step 4: Layout minimal** `app/layout.tsx` (lang `id`; font sendiri dipasang di Task 5) + `app/page.tsx` pengganti sementara.

- [ ] **Step 5: Jalankan `npx shadcn@latest init` (default/neutral, tanpa overwrite sangat dari globals.css)** lalu `npx shadcn@latest add button card badge`.

- [ ] **Step 6: Verifikasi build statis**: `npx next build` → ADA folder `out/` berisi `index.html`; `npx vitest run` → "no tests" (bukan error). Tambah script `build: "next build"` di `package.json`.

- [ ] **Step 7: Commit** `chore: scaffold next static app`.

### Task 2: Konten contoh + settings boy

**Files:**
- Create: `guru/boy/settings.json`, `guru/boy/md/01-sistem-tata-surya.md`, `guru/boy/md/02-siapa-pak-boy.md` (tanpa frontmatter — jadi fixture utk Review Focus #2), `guru/boy/gambar/sistem-tata-surya.svg` (SVG sederhana, ditulis inline)

**Interfaces:**
- Produces: fixture nyata yang dipakai test Task 3 dan halaman Task 7.
- `settings.json` persis: `{"namaGuru":"Boy","mapel":"IPA","judulSitus":"Materi IPA Pak Boy","deskripsi":"Kumpulan materi IPA","temaWarna":"biru"}`
- `01` memakai frontmatter (`judul`, `tanggal`, `ringkasan`) + contoh gambar + `:::youtube dQw4w9WgXcQ`.

- [ ] **Step 1: Tulis ketiga file konten** (MD mengandung: heading, list, gambar `![...](gambar/sistem-tata-surya.svg)`, tabel sederhana, directive `:::youtube dQw4w9WgXcQ`, file `02` tanpa frontmatter).

- [ ] **Step 2: Commit** `test: sample guru content`.

### Task 3: `lib/content.ts` — jantung pemproses konten

**Files:**
- Create: `lib/content.ts`, `vitest.config.ts`
- Test: `lib/content.test.ts`

**Interfaces (Produces — dipakai semua task halaman):**
```ts
type Settings = { namaGuru: string; mapel: string; judulSitus: string; deskripsi: string; temaWarna: string }
type MateriMeta = { slug: string; judul: string; tanggal: string | null; ringkasan: string }
type Block = { type: "html"; html: string } | { type: "youtube"; id: string }
function activeGuru(): string        // process.env.GURU ?? "boy"
function getSettings(guru: string): Settings   // fallback: namaGuru=guru, mapel/judul/deskripsi/temaWarna default
function listMateri(guru: string): MateriMeta[] // file .md urut leksikografis; slug = nama file tanpa ".md" & tanpa prefix "NN-"
function getMateri(guru: string, slug: string): { meta: MateriMeta; blocks: Block[]; raw: string } | null
```
- Parsing: frontmatter via `gray-matter`; `:::youtube <id>` diganti token `<div data-youtube="ID"></div>` lalu `marked` merender seluruh MD; HTML dipecah jadi `Block[]` memotong token tsb (id divalidasi regex `[A-Za-z0-9_-]+`, invalid → dibuang).
- Path gambar `gambar/...` di-rewrite jadi `/gambar/...` pada html hasil.

- [ ] **Step 1: Tulis test (gagal dulu)** — minimum assertions, semua murni dari fixture Task 2 + fixture sementara `tmp/`:
  1. `listMateri("boy")` → 2 item, urut `sistem-tata-surya` dulu, slug tanpa `01-`.
  2. `getMateri("boy","sistem-tata-surya").meta.judul === "Sistem Tata Surya"` (dari frontmatter) dan `02-...` judulnya dari heading pertama.
  3. blocks: satu block `youtube` berotentipe `{type:"youtube", id:"dQw4w9WgXcQ"}` + ≥2 block html.
  4. html mengandung `src="/gambar/sistem-tata-surya.svg"`.
  5. MD inline dengan `:::youtube aBc=99|xx` (id tak valid) → block youtube dibuang, parse tetap sukses.
  6. `getSettings("anonim")` (folder tanpa settings.json) → fallback bernama `anonim`.
  7. guru dengan `md/` kosong → `[]`.

- [ ] **Step 2: `npx vitest run` → FAIL** (module belum ada).

- [ ] **Step 3: Implement `lib/content.ts`**(sig di atas; pemrosesan seperti catatan Interfaces).

- [ ] **Step 4: `npx vitest run` → PASS.**

- [ ] **Step 5: Commit** `feat: content pipeline (settings, list, blocks, youtube, image paths)`.

### Task 4: Salin aset gambar guru → `public/gambar`

**Files:**
- Create: `build-assets.mjs`
- Modify: `package.json` — scripts `"build": "node build-assets.mjs && next build"` dan `"dev": "node build-assets.mjs && next dev"` memanggil salin aset dulu
- Test: `build-assets.test.mjs`

**Interfaces:**
- Produces: `public/gambar/**` (file dari `guru/<activeGuru()>/gambar/**` disalin ternama, termasuk subfolder; buat `public/` bila belum ada).

- [ ] **Step 1: Tulis test** `build-assets.test.mjs`: buat `tmp/mini/{settings.json,gambar/a.svg}`, set `GURU` env ke fixture, jalankan script via `node build-assets.mjs`, assert `public/gambar/a.svg` ada; bersihkan.

- [ ] **Step 2: `npx vitest run` → FAIL.**

- [ ] **Step 3: Implement `build-assets.mjs`** (fs.cp recursive; baca guru aktif dari env yang sama dengan `activeGuru()`).

- [ ] **Step 4: `npx vitest run` → PASS.** Lalu jalankan asli: `node build-assets.mjs` → `public/gambar/sistem-tata-surya.svg` ada.

- [ ] **Step 5: Tambah kedua script di atas; commit** `feat: asset copy pipeline`.

### Task 5: Layout dasar — tipografi mobile-first & temaWarna

**Files:**
- Modify: `app/layout.tsx`, `app/globals.css`
- Create: `lib/theme.ts` (map `temaWarna` → CSS custom properties: `biru` default, `hijau`, `ungu`, `merah`, `jingga`)

**Interfaces:**
- Consumes: `getSettings(activeGuru())`.
- Produces: `<html>` ber-`data-tema="<temaWarna>"`; font Plus Jakarta Sans via `next/font` (dengan fallback system); metadata per guru (`title`, `description` dari `judulSitus`/`deskripsi`).

- [ ] **Step 1: Pasang font + metadata** dari settings; set `font` variabel CSS di layout.

- [ ] **Step 2: globals.css** — basis tipografi mobile: `html { font-size: 17px }` mobile (≥768px: 18px), variabel tema per `data-tema`, `scroll-behavior: smooth`.

- [ ] **Step 3: Verifikasi build:** `npm run build`; grep `out/index.html` berisi `data-tema="biru"` dan css font dari next/font. Commit `feat: fonts, theme palettes, mobile-first base`.

### Task 6: Halaman utama materi + detail materi

**Files:**
- Modify: `app/page.tsx`
- Create: `app/materi/[slug]/page.tsx`, `components/materi-card.tsx`, `components/site-header.tsx`

**Interfaces:**
- Consumes: `listMateri`, `getMateri`, `getSettings`, `Block` dari Task 3; `public/gambar/**` Task 4.
- Produces: route `/` (daftar materi) dan `/materi/<slug>` (detail, per block di-render); `components/SiteHeader` dipakai keduanya; `renderBlocks`-nya dipakai Task 8/9.

- [ ] **Step 1: `generateStaticParams`** dari `listMateri` untuk route detail; `generateMetadata` per materi.

- [ ] **Step 2: Halaman `/`** — header namaSitus + namaGuru/mapel (dari settings), daftar `materi-card` (judul, tanggal, ringkasan); **empty-state** bila daftar kosong (`md/` kosong — pin Review Focus #5): pesan "Belum ada materi" + ajakan.

- [ ] **Step 3: Detail materi** — judul besar, tanggal, lalu blocks: `html` lewat `dangerouslySetInnerHTML` dengan kelas `prose` (typography), `youtube` lewat `<YouTubeEmbed>` placeholder sementara (div dengan id) — diganti asli di Task 8.

- [ ] **Step 4: Verifikasi build:** `npm run build` → `out/materi/<slug>/index.html` ada untuk 2 fixture; grep konten judul `02` muncul di `out/materi/siapa-pak-boy/index.html`. Commit `feat: materi index & detail pages`.

### Task 7: Polish tampilan — prose, gambar, keterbacaan HP

**Files:**
- Modify: `app/globals.css`, `components/materi-card.tsx`, `components/site-header.tsx`, `app/materi/[slug]/page.tsx`

**Interfaces:**
- Consumes: kelas `prose` (typography plugin), palet tema Task 5.

- [ ] **Step 1: Prose tuning** — radius/border pada `img` di dalam `prose`, judul ukuran clamp() responsif, `h2/h3` berjarak lega, tabel `overflow-x-auto`, kode blok beda warna latar, heading `#` pertama di detail tak diulik dobel dengan judul halaman dari frontmatter.

- [ ] **Step 2: Detail HP** — padding aman `env(safe-area-inset)`, `text-wrap: pretty` di p/heading, target sentuh ≥44px di header nav.

- [ ] **Step 3: Halaman depan enak dipindai** — kartu materi gap konsisten, teks ringkasan `line-clamp-3`, header (`SiteHeader`) tetap ringkas.

- [ ] **Step 4: Verifikasi** — `npm run build` sukses; screenshot reviewer (subagent) mobile 375px & desktop 1280px dapat disimak. Commit `style: prose & mobile polish`.

### Task 8: Komponen YouTube embed (lazy, nocookie)

**Files:**
- Create: `components/youtube-embed.tsx` (client), `lib/youtube.ts`
- Test: `lib/youtube.test.ts`

**Interfaces:**
- Consumes: `Block {type:"youtube", id}` di `app/materi/[slug]/page.tsx`.
- Produces: `youtubeThumbUrl(id: string): string` → `https://i.ytimg.com/vi/<id>/hqdefault.jpg`; `youtubeEmbedUrl(id: string): string` → `https://www.youtube-nocookie.com/embed/<id>?rel=0&autoplay=1`.

- [ ] **Step 1: Tulis test** untuk kedua helper di atas (exact URL).

- [ ] **Step 2: `npx vitest run` → FAIL** → **implement** `lib/youtube.ts` → **PASS**.

- [ ] **Step 3: `components/youtube-embed.tsx`** — client component: awalnya tombol `aspect-video` dengan thumbnail + ikon play (lucide sudah via shadcn); saat klik render iframe embed URL, `allow="autoplay; encrypted-media"`, `title` dari props.

- [ ] **Step 4: Gantikan placeholder Task 6 step 3.** Verifikasi: build sukses; di `out/materi/sistem-tata-surya/index.html` ada thumb URL (iframe baru muncul sesudah interaksi — itu normal). Commit `feat: lazy youtube embed`.

### Task 9: Animasi & transisi (framer-motion, hormati reduced-motion)

**Files:**
- Create: `components/motion.tsx` (wrapper `FadeIn`, `Stagger`)
- Modify: `app/page.tsx` (stagger kartu), `app/materi/[slug]/page.tsx` (fade konten), `components/site-header.tsx`

**Interfaces:**
- Produces: `<FadeIn>` (fade+slide ringan, `useReducedMotion` → tanpa transform) dipakai tasks halaman.

- [ ] **Step 1: Implement wrapper** dengan framer-motion + `useReducedMotion()` — bila true: hanya opacity 0→1, durasi 0, tanpa y-translate.

- [ ] **Step 2: Pasang di halaman** (list: stagger delay 40ms/kartu; detail: satu fade saat mount).

- [ ] **Step 3: Verifikasi:** `npm run build` sukses; reviewer cek durasi ≤ 0.6s dengan easing bawaan. Commit `feat: smooth transitions w/ reduced-motion`.

### Task 10: `build.ps1` — alur guru: build / watch / deploy

**Files:**
- Create: `build.ps1`, `README.md`

**Interfaces:**
- Consumes: scripts `npm run dev` & `npm run build` (Task 4), `activeGuru()` env `GURU` (Task 3).
- Produces: `.\build.ps1 -Target boy` (build + buka preview di `http://localhost:4177` via `npx serve out -l 4177`), `.\build.ps1 -Watch` (mode `next dev`), `.\build.ps1 -Deploy` (build + `firebase deploy --only hosting:boy`, hanya bila `firebase.json` tersedia — Task 11).

- [ ] **Step 1: Tulis `build.ps1`** logic: `npm install` bila `node_modules` hilang; set `$env:GURU=$Target`; cabang `-Watch` / `-Deploy` / default (build+preview); pesan Indonesia bila node/firebase belum ada.

- [ ] **Step 2: Run `.\build.ps1`** → `out/` fresh, preview menyala lalu dihentikan.

- [ ] **Step 3: `.\build.ps1 -Watch`** → dev server hidup; perubahan file MD terlihat saat refresh.

- [ ] **Step 4: Tulis `README.md`** — panduan guru: struktur folder, cara menulis (tabel sintaks gambar & `:::youtube`), alur harian. Commit `feat: powershell workflow + panduan`.

### Task 11: Homepage sekolah (MODE=home) + firebase.json

**Files:**
- Modify: `app/page.tsx` (cabang logika `MODE=home` di halaman `/`), `lib/content.ts` (tambah `listGuru(): {namaGuru, subdomain}[]` dari `guru/*/settings.json`)
- Create: `firebase.json`, `.firebaserc`

- [ ] **Step 1: `listGuru()`** — scan `guru/*` yang berisikan `settings.json`; vitest (fixture tmp): 2 guru → 2 entri bernama benar.

- [ ] **Step 2: Cabang `app/page.tsx`** `MODE=home`: hero nama sekolah (sederhana ala kadanya) + kartu daftar guru → link `https://<nama>.manurhidma.my.id`.

- [ ] **Step 3: firebase.json:** dua site — `"boy": {"target":"boy","public":"out"}` dan `"school": {"target":"home","public":"out"}`; `.firebaserc` menata target site (nama site: `boy-manurhidma`, `manurhidma-school` — dibuat di console, dokumentasi di README).

- [ ] **Step 4: Verifikasi:** `MODE=home npm run build` → `out/index.html` mengandung link subdomain; build biasa (`GURU=boy`) tak berubah. Commit `feat: school home + firebase targets`.

---

## Catatan Keputusan yang Diambil Tanpa Jawaban Pengguna

1. **Struktur materi flat**, urut leksikografis nama file (Review Focus #1) — ganti ke bab/kategori kalau nanti diminta.
2. **Gambar dibiarkan besar apa adanya** (tidak di-resize saat build).
3. Firebase dianggap **belum ter-setup**: semua langkah deploy opsional dan didokumentasi; tanpa akun Firebase pun seluruh aplikasi sudah berguna via preview lokal.
4. Konten contoh memakai guru "Boy" dengan 2 materi fixture — lorem bebas diganti konten asli guru.
