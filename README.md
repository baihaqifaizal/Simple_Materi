# Simple Materi

Materi guru ditulis di **Markdown**, tampil sebagai website statis yang indah. Firebase Hosting, tanpa server.

```
guru/
└── boy/              → tampil di boy.manurhidma.my.id
    ├── settings.json  (namaGuru, mapel, judulSitus, deskripsi, temaWarna)
    ├── md/            ← materi ditulis di sini
    └── gambar/        ← gambar yang dipakai MD
```

## Alur harian guru

1. **Menulis/edit** `.md` di `guru/<nama>/md/` (taruh gambar di `guru/<nama>/gambar/`).
   - Setiap nama folder di `guru/<nama>` otomatis menjadi subdomain `https://<nama>.manurhidma.my.id`.
2. **Cara Menjalankan & Deploy**:
   - **Cukup 1-Klik**: Jalankan `menu.cmd` -> Pilih `[2] 1-Klik Deploy Cloudflare Pages (Semua Guru Otomatis)`
   - Atau lewat PowerShell:
     - `.\build.ps1 -Deploy` — otomatis build seluruh folder guru sekaligus & deploy ke Cloudflare project `simple-materi`.
     - `.\build.ps1 -Target boy -Watch` — mode live preview materi lokal di http://localhost:3000

## Setup Kustom Domain di Cloudflare Pages (Cukup Sekali di Awal)

Karena project di Cloudflare Pages hanya 1 yaitu **`simple-materi`**:
1. Buka [Cloudflare Dashboard](https://dash.cloudflare.com/) -> **Workers & Pages**.
2. Klik project **`simple-materi`**.
3. Buka tab **Custom domains** -> Klik **Set up a custom domain**.
4. Masukkan subdomain guru (misal `boy.manurhidma.my.id` atau gunakan CNAME wildcard `*.manurhidma.my.id`).
5. Klik **Activate domain**.
6. Router internal Cloudflare Pages (`_worker.js`) akan otomatis mendeteksi subdomain dari URL browser dan menyajikan folder guru yang sesuai!

## Sintaks khusus di MD

| Kebutuhan  | Cara menulis                                                            |
| ---------- | ----------------------------------------------------------------------- |
| Judul & tanggal | Baris teratas file (frontmatter): `judul:` / `tanggal:` / `ringkasan:` |
| Gambar     | `!foto.png` — baris sendiri, file di `guru/<nama>/gambar/`. Nama dasar dicocokkan, jadi `!foto.jpg` tetap menemukan `foto.jpeg`. Format lama `![keterangan](gambar/foto.png)` masih jalan |
| Video YouTube | Tempel URL-nya di baris sendiri: `https://www.youtube.com/watch?v=KODE` (parameter `&pp=`, `&t=` ikut dibuang). `:::youtube KODE` tetap jalan |
| Perbesar gambar | Klik/tap gambar di materi → tampil penuh. Tutup lewat tombol X, klik area gelap, atau tombol `Esc` |

Nama file menentukan urutan & alamat: `01-...md` tampil pertama; alamatnya
`/materi/<nama-tanpa-awalan-angka>/`.

## Setup sekali (terbit ke domain)

1. `npm install -g firebase-tools`
2. `firebase login`
3. Buat 2 site di Console → Hosting: `manurhidma-school` dan `boy-manurhidma`
4. `firebase targets:apply hosting boy boy-manurhidma --project <ID-PROJECT>`
5. `firebase targets:apply hosting school manurhidma-school --project <ID-PROJECT>`
6. Sambungkan domain di Console: site `manurhidma-school` → `manurhidma.my.id`,
   site `boy-manurhidma` → `boy.manurhidma.my.id` (ikuti catatan DNS dari Firebase).
7. Terbit: `.\build.ps1 -Deploy -Target boy` atau `-Target school`.
