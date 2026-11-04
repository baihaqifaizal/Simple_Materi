# Desain: Sintaks Gambar Ringkas & URL YouTube

Tanggal: 2026-11-04
Status: disetujui & diimplementasikan

## Maksud

Guru menulis materi tanpa harus mengingat path folder. Gambar cukup ditulis
dengan nama filenya, video cukup ditempel sebagai URL YouTube biasa.

## Tujuan

- `!Musik Teori.jpg` pada satu baris → tampil sebagai gambar dari
  `guru/<guru>/gambar/`, alt text = nama file.
- URL YouTube pada satu baris → embed lazy seperti `:::youtube` sekarang.
- Format lama tetap jalan: `![alt](gambar/foto.png)` dan `:::youtube <id>`.

## Non-tujuan

- Video lokal (`.mp4`/`.webm`) — tetap tidak didukung.
- Membaca gambar dari folder lain selain `guru/<guru>/gambar/`.
- Optimasi/transcode gambar.
- Mengubah pipeline copy aset (`build-assets.mjs` sudah rekursif).

## Pendekatan

**Gambar dan YouTube: perluas preprocessor teks yang sudah ada** (dipilih).
Satu tempat, `lib/content.ts`, jalan sebelum `marked`, dan otomatis ikut
masuk ke dalam `<details>` hasil `preprocessCollapsibleHeading`.

Alternatif yang dibuang:

- *Marked extension / custom tokenizer*: lebih "benar" secara parser, tapi
  menambah pola baru di codebase yang seluruh pemrosesannya berbasis regex
  string. Tidak sepadan untuk dua sintaks.
- *Regex pada HTML hasil `marked`*: rapuh terhadap escaping dan tidak bisa
  memakai mekanisme placeholder `data-youtube` yang sudah ada.

## Aturan gambar

Baris yang isinya hanya `!<nama>.<ext>` (opsional diikuti bullet list)
dianggap gambar:

```md
!Musik Teori.jpg
!note.png
- !doremi.png
```

- Ekstensi yang dikenali: `jpg`, `jpeg`, `png`, `gif`, `webp`, `svg`, `avif`
  (case-insensitive).
- Pencarian hanya di `guru/<guru>/gambar/`, urut:
  1. nama persis (case-insensitive di Windows),
  2. basename sama dengan ekstensi `jpg`/`jpeg` dianggap setara,
  3. basename sama dengan ekstensi gambar apa pun.
- Subfolder didukung: `!sub/foto.png`.
- Output: `<img src="/gambar/<path-ter-encode>" alt="<nama tanpa ext>">`.
  Spasi di-encode jadi `%20`; alt di-escape HTML.
- File tidak ditemukan → baris dibiarkan apa adanya (guru bisa melihat
  tulisannya) dan `console.warn` sekali per file saat build.
- Format lama `![alt](gambar/foto.png)` tetap didukung, dan diperbaiki agar
  path berspasi (`gambar/Musik Teori.jpeg`) ikut ter-rewrite.

## Aturan YouTube

Baris yang isinya hanya satu URL YouTube dianggap embed:

```md
https://www.youtube.com/watch?v=J2aoEWRyb5Y&pp=ygULY2hlc3Qgdm9pY2U%3D
```

- Host: `youtube.com`, `www.youtube.com`, `m.youtube.com`,
  `music.youtube.com`, `youtu.be`, `youtube-nocookie.com`.
- Bentuk: `/watch?v=ID`, `youtu.be/ID`, `/shorts/ID`, `/embed/ID`,
  `/live/ID`, `/v/ID`.
- Parameter lain (`pp`, `t`, `si`, `list`, dst.) dibuang.
- ID divalidasi `^[A-Za-z0-9_-]+$`. Valid → placeholder
  `<div data-youtube="ID"></div>` yang sudah ditangani `MateriContent`.
- URL bukan YouTube atau ID tidak valid → baris dibiarkan, jadi tampil
  sebagai link biasa.
- `:::youtube <url>` memakai parser yang sama, sehingga URL ber-parameter
  juga jalan. Perilaku lama untuk ID invalid (dibuang) dipertahankan.

## File yang disentuh

- `lib/content.ts` — dua preprocessor + helper resolusi gambar/parser URL.
- `lib/content.test.ts` — fixture temporer baru + kasus uji baru.
- `README.md`, `pamai.md` — tabel sintaks.
- `docs/superpowers/specs/2026-11-04-sintaks-gambar-youtube-design.md` — dokumen ini.

## Catatan verifikasi

- `npm test` saat ini sudah merah (5 gagal) karena `guru/boy/md/` tidak lagi
  punya `sistem-tata-surya.md` dan `siapa-pak-boy.md`. Test itu dipindah ke
  fixture temporer supaya suite hijau kembali; bukan regresi dari perubahan ini.
- Kasus uji baru: shorthand ketemu beda ekstensi (`jpg` → `jpeg`), subfolder,
  spasi, file hilang, URL dengan `&pp=`, `youtu.be`, `/shorts/`, URL non-YouTube,
  kompatibilitas `![alt](gambar/...)` dan `:::youtube`.

## Tambahan: Perbesaran Gambar

- Klik/tap gambar di dalam materi membuka overlay penuh (`role="dialog"`,
  portal ke `document.body`, `position: fixed` supaya tidak terpotong
  `<details>`).
- Tutup lewat tombol X, klik area gelap, atau `Esc`. Klik gambar besar
  sendiri tidak menutup.
- Fokus pindah ke tombol tutup saat terbuka dan kembali ke elemen asal saat
  ditutup; scroll body dikunci selama overlay terbuka.
- Implementasi di `components/materi-content.tsx` lewat event delegation,
  tanpa mengubah HTML hasil `marked`. Gaya `cursor: zoom-in` di `.prose img`.
- Uji interaksi di `components/materi-content.test.tsx` (jsdom +
  `@testing-library/react`).
