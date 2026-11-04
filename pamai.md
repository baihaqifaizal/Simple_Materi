# PAMAI — Pemahaman Intent Aplikasi

> Dokumen ini bukan spesifikasi teknis final. Ini tulisan "aku paham maksudmu begini" — silakan koreksi bagian mana pun sebelum lanjut desain/coding.

## 1. Siapa & Kenapa

- **Pengguna utama (penulis):** guru-guru (kamu & rekan guru; pertama: **Pak Boy**) — bukan programmer.
- **Pengguna akhir (pembaca):** murid / publik.
- **Naluri utamamu:** guru menulis materi di Markdown, sisanya harus otomatis. Tidak ada langkah "ngoding", tidak ada yang menyentuh HTML/CSS/JS.

## 2. Konsep Inti (satu kalimat)

**MD = sumber kebenaran. Website = tampilan indahnya. PowerShell = jembatannya. Firebase = lahan parkirnya.**

```
guru/
├── boy/                 ← Rak milik guru Boy (nanti guru lain punya rak sendiri)
│   ├── settings.json    ← identitas & pengaturan guru (nama, mapel, tema, judul site)
│   ├── md/              ← materi ditulis di sini (sumber kebenaran)
│   └── gambar/          ← file gambar yang direferensikan oleh MD
├── (guru berikutnya: anak/, sarah/, ...)
└── (semua guru berada di dalam folder /guru/)
```

Siklus kerja guru tiap update:

1. Tulis / edit / drop file MD ke `guru/boy/md/`, taruh gambar di `guru/boy/gambar/`.
2. Buka PowerShell yang sudah disiapkan (satu script).
3. Konten **boy.mamanurhidma.my.id** ter-update. Selesai.

## 3. Arsitektur Domain (baru — dari kamu)

| Domain | Isi | Peran |
|---|---|---|
| `mamanurhidma.my.id` | Homepage web sekolah | Host utama — tampilan depan sekolah |
| `boy.manurhidma.my.id` | Materi-materi guru Boy | Subdomain per guru, konten dari `guru/boy` |
| `<nama>.manurhidma.my.id` | Materi guru lain (nanti) | Pola sama, rak `guru/<nama>` |

Catatan: domain sudah dikonfirmasi — `manurhidma.my.id`, subdomain guru: `boy.manurhidma.my.id`.

## 4. Prioritas #1: Tampilan Harus Sangat Indah & Nyaman Dibaca

- **Mobile design enak dibaca** — mayoritas murid buka dari HP; mobile-first, bukan sekadar "responsive".
- Transisi & animasi halus.
- Tipografi nyaman, prose/heading yang punya karakter.
- Halaman depan sekolah (`manurhidma.my.id`) ikut bagus — tapi dulu **sederhana ala kadanya**; yang dipertalenta tetap halaman materi.

## 4b. Pilihan Teknologi (dari kamu — sudah final)

- **Next.js + Tailwind + shadcn/ui (default)** — bukan JS murni.
- Semua di-export **static** (`next build` dengan `output: 'export'`) supaya tetap nyaman di-hosting tanpa server yang harus hidup selamanya.
- PowerShell jalanin build + deploy; guru tetap tidak menyentuh kode.


## 5. Kemampuan Markdown Yang Diminta

| Kebutuhan | Cara di MD (usulan, masih bisa diubah) |
|---|---|
| Materi biasa | Markdown standar: heading, list, tabel, blok kode, kutipan |
| **Insert gambar** | `!foto.png` (baris sendiri) — file cukup ditaruh di `guru/boy/gambar/`. Format lama `![deskripsi](gambar/foto.png)` tetap jalan |
| **Insert video YouTube** | Tempel URL YouTube di baris sendiri, misal `https://www.youtube.com/watch?v=dQw4w9WgXcQ&pp=...` → embed iframe lazily-loaded (thumbnail dulu, iframe baru nyala saat diklik). `:::youtube dQw4w9WgXcQ` tetap jalan |
| Gambar ikut ter-deploy | Saat build, `gambar/` di-copy ke situs |

## 6. Firebase / Hosting

- Firebase **hanya Hosting**, memakai custom domain `manurhidma.my.id` + subdomain per guru.
- Satu project Firebase bisa punya beberapa site/target hosting — jadi `boy` deploy ke situs sendiri tanpa mengganggu halaman utama.
- Tanpa Firestore/Auth/Functions. Konsep statik murni.
- Alternatif ringan (GitHub Pages / Cloudflare Pages) bisa jadi cadangan — nanti kupilihkan di tahap desain.

## 7. Anti-Goal

- Guru harus ngerti HTML/CSS/JS untuk update materi → **gagal**.
- Proses update butuh banyak perintah / setup tiap kali → **gagal**.
- Tampilan "markdown viewer abu-abu polos" → **gagal utama**.
- Perlu server Node berjalan selamanya → **gagal**.

---

## 8. Pertanyaan Terbuka (jawab yang penting aja)

1. **Halaman sekolah `manurhidma.my.id`:** ikut dibangun sekarang dalam project ini, atau dulu fokus `boy.*` dan homepage menyusul? Kalau ikut: isinya apa saja (profil sekolah, daftar link ke subdomain para guru, pengumuman)?
2. **Daftar guru:** homepage sekolah nantinya menampilkan link ke subdomain setiap guru — daftar ini ditulis manual (di MD/settings) atau otomatis dari daftar folder `guru/*`?
3. **settings.json (sudah diputuskan):** `namaGuru`, `mapel`, `judulSitus`, `deskripsi`, `temaWarna` — cukup itu dulu, bisa ditambah nanti kalau perlu.
4. **Struktur materi per guru:** satu MD = satu pertemuan/topik? Perlu bab/kategori?
5. **Firebase:** sudah punya project/akun, atau belum sama sekali?
6. **Deploy:** cukup manual (buka .ps1 → build → deploy), atau watch-mode otomatis saat lokal?
7. **Referensi visual:** ada situs yang "ooh ini yang kumau"? (skip kalau tidak ada)
8. **Gambar besar dari HP** — mau di-resize otomatis saat build, atau biarkan apa adanya?
