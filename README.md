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
2. **PowerShell** di folder project:
   - `.\build.ps1` — bangun + buka preview di http://localhost:4177
   - `.\build.ps1 -Watch` — mode tulis, materi live di http://localhost:3000
   - `.\build.ps1 -Deploy` — build lalu terbit ke `<nama>.manurhidma.my.id`
3. Selesai.

## Sintaks khusus di MD

| Kebutuhan  | Cara menulis                                                            |
| ---------- | ----------------------------------------------------------------------- |
| Judul & tanggal | Baris teratas file (frontmatter): `judul:` / `tanggal:` / `ringkasan:` |
| Gambar     | `![keterangan](gambar/foto.png)` — file ada di folder `gambar/`          |
| Video YouTube | Baris sendiri: `:::youtube KODE_VIDEO` (atau tautan penuh)           |

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
