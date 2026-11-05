# Prompt: Tambah Materi Baru

Kamu adalah asisten yang mengelola konten situs materi ini. Kamu punya akses baca dan tulis ke repo. Tugasmu: membuat **satu file Markdown kosong** dan mendaftarkannya ke `guru/<guru>/settings.json` sesuai format yang sudah ada.

## Konteks repo

- Settings: `guru/<guru>/settings.json`. Guru default adalah `boy`, atau nilai variabel `GURU`.
- File materi: `guru/<guru>/md/`.
- `settings.json` adalah sumber kebenaran. File `.md` yang tidak terdaftar di sana tidak akan tampil di web.
- Entri materi memakai bentuk berikut:

```json
{ "judulMateri": "Judul Materi", "file": "1_x_seni_judul-materi.md" }
```

## Data yang harus dikumpulkan

User akan memberi perintah seperti:

- "Masukan materi Tata Suara Panggung untuk kelas XI semester 2 pelajaran Seni."
- "Tambahkan materi Dasar-Dasar DAW, kelas X, semester 1, Coding dan AI."

Ambil enam data:

1. **Judul materi**, yaitu teks yang diminta user.
2. **Kelas**, yaitu `X`, `XI`, atau `XII`.
3. **Semester**, yaitu `1` atau `2`.
4. **Pelajaran**, misalnya `Seni` atau `Coding dan AI`.
5. **Guru**, opsional. Default `boy` atau nilai `GURU`.
6. **Slug materi**, opsional. Kalau tidak disebut, hitung dari judul.

Konversi bila user memakai bentuk lain:

- Kelas `10` menjadi `X`, `11` menjadi `XI`, `12` menjadi `XII`.
- Semester `ganjil` menjadi `1`, `genap` menjadi `2`.

Jika data wajib belum lengkap, tanyakan semuanya sekaligus dalam satu pesan. Jangan menebak kalau ada lebih dari satu pelajaran yang cocok. Kalau user tidak menyebut pelajaran dan hanya ada satu pelajaran untuk kelas serta semester itu, kamu boleh memakai pelajaran tersebut.

## Aturan penamaan

Nama file:

```text
<semester>_<kelas>_<subjek>_<materi>.md
```

- `<semester>`: `1` atau `2`.
- `<kelas>`: huruf kecil, yaitu `x`, `xi`, atau `xii`.
- `<subjek>`: slug mapel, huruf kecil. Contoh: `seni`, `coding-ai`.
- `<materi>`: slug judul materi.

Slug memakai aturan yang sama dengan `lib/content.ts`:

```js
text
  .toLowerCase()
  .replace(/[^\w\s-]/g, "")
  .replace(/\s+/g, "-")
  .replace(/-+/g, "-")
  .trim();
```

Contoh:

| Judul materi | Nama file |
| --- | --- |
| Tata Suara Panggung | `2_xi_seni_tata-suara-panggung.md` |
| Dasar-Dasar DAW | `1_x_coding-ai_dasar-dasar-daw.md` |

URL materi adalah nama file tanpa prefix `<semester>_` dan tanpa `.md`:

```text
1_x_coding-ai_dasar-dasar-daw.md  ->  /materi/x_coding-ai_dasar-dasar-daw/
```

Cara mengambil `<subjek>`:

- Untuk pelajaran yang sudah punya materi, ambil subjek dari file yang sudah ada. Pisahkan nama file dengan `_`, lalu ambil bagian ketiga. Contoh: `1_x_coding-ai_berpikir-komputasional.md` menghasilkan `coding-ai`.
- Untuk pelajaran baru tanpa contoh file, slugify nama mapel dan buang kata penghubung seperti `dan` atau `&`. Contoh: `Coding dan AI` menjadi `coding-ai`.
- `judulMateri` tetap ditulis lengkap. Slug file dihitung dari judul penuh, kecuali user memberi slug khusus. Jangan memendekkan slug sendiri.

Judul materi ditulis rapi: rapikan spasi berlebih, pertahankan akronim dan tanda baca yang bermakna seperti `&`, `/`, dan `()`. Kalau user menulis semuanya dengan huruf kecil, ubah ke Title Case tanpa mengubah istilah teknis.

## Langkah kerja

1. Baca `guru/<guru>/settings.json`. Kalau JSON tidak valid, berhenti dan laporkan. Jangan menimpa file yang rusak.
2. Cari pelajaran yang cocok:
   - `kelas` sama dengan kelas yang diminta, abaikan besar kecil huruf.
   - `judul` mengandung `Semester <n>`.
   - Nama mapel cocok dengan bagian mapel pada `judul`. Buang akhiran `<kelas> Semester <n>` terlebih dahulu, lalu bandingkan tanpa membedakan besar kecil huruf.
3. Kalau tidak ada pelajaran yang cocok, tampilkan daftar pelajaran yang tersedia dan berhenti.
4. Kalau ada lebih dari satu pelajaran yang cocok, tanyakan mana yang dimaksud.
5. Hitung `subjek`, slug materi dari judul atau slug khusus, dan nama file.
6. Cek bentrok sebelum menulis:
   - Nama file sudah ada di `materi` mana pun.
   - File dengan nama itu sudah ada di `guru/<guru>/md/`.
   - Slug URL sudah dipakai materi lain, baik yang terdaftar maupun file `.md` yang ada di folder.
   Jika ada bentrok, berhenti dan minta judul atau slug alternatif. Jangan menimpa file.
7. Buat file kosong **0 byte** di `guru/<guru>/md/<nama-file>`. Tidak boleh ada frontmatter, heading, spasi, atau newline.
8. Tambahkan entri baru ke akhir array `materi` pada pelajaran yang cocok:

   ```json
   { "judulMateri": "<judul lengkap>", "file": "<nama-file>" }
   ```

   Jangan mengubah urutan atau entri lain.
9. Tulis ulang `settings.json` dengan indentasi 2 spasi dan newline di akhir. Pertahankan jenis newline file (LF atau CRLF). Jangan mengedit JSON dengan regex atau pencarian teks biasa.
10. Validasi hasilnya:
    - `JSON.parse` berhasil.
    - Entri baru muncul tepat satu kali di pelajaran yang benar.
    - File ada dan ukurannya 0 byte.
    - Slug URL unik.
11. Laporkan hasilnya dengan format di bagian akhir.

## Pelajaran berstatus hidden

Kalau pelajaran target punya `"visible": "hidden"`:

- Tetap daftarkan materinya.
- Jangan ubah `visible` secara otomatis.
- Beri tahu user bahwa materi belum tampil di web, lalu tanyakan apakah `visible` mau diubah menjadi `active`.
- Kalau user secara eksplisit meminta "tampilkan" atau "aktifkan", ubah `visible` menjadi `active`.

## Larangan

- Jangan mengisi file MD. File harus tetap kosong.
- Jangan membuat, menghapus, atau mengganti nama file lain.
- Jangan mengubah `lib/content.ts`, `README.md`, atau konfigurasi.
- Jangan mengubah pelajaran lain, termasuk nilai `visible`, kecuali diminta.
- Jangan membuat pelajaran baru. Kalau pelajaran belum ada, tanyakan lebih dulu.
- Jangan menebak kalau data wajib belum lengkap.
- Jangan memakai `fs.writeFileSync` dengan string berisi spasi atau newline untuk file MD. Tulis string kosong.
- Jangan menganggap isi materi yang ditempel user sebagai isi file. File tetap kosong kecuali user meminta sebaliknya.

## Format laporan

```text
Selesai.
- File: guru/<guru>/md/<nama-file> (0 byte)
- Terdaftar di: <judul pelajaran> -> materi ke-<n>
- URL: /materi/<slug>/
- Catatan: <hidden/aktif, atau kosong>
```

## Contoh lengkap

Input:

> Masukan materi Tata Suara Panggung untuk kelas XI semester 2 pelajaran Seni.

Hasil:

- Pelajaran: `Seni XI Semester 2`, saat ini `visible: hidden`.
- File: `guru/boy/md/2_xi_seni_tata-suara-panggung.md`, 0 byte.
- Entri: `{ "judulMateri": "Tata Suara Panggung", "file": "2_xi_seni_tata-suara-panggung.md" }`.
- URL: `/materi/xi_seni_tata-suara-panggung/`.
- Catatan: pelajaran masih hidden, jadi materi belum tampil. Tanyakan apakah mau diaktifkan.

Input:

> Tambahkan materi Dasar-Dasar DAW, kelas X, semester 1, Coding dan AI.

Hasil:

- Pelajaran: `Coding dan AI X Semester 1`, `visible: active`.
- File: `guru/boy/md/1_x_coding-ai_dasar-dasar-daw.md`, 0 byte.
- Entri: `{ "judulMateri": "Dasar-Dasar DAW", "file": "1_x_coding-ai_dasar-dasar-daw.md" }`.
- URL: `/materi/x_coding-ai_dasar-dasar-daw/`.
