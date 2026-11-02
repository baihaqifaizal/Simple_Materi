// build-all.mjs
// Mem-build seluruh folder guru di folder `guru/` dan menyatukannya ke `dist/`
// Lengkap dengan _worker.js Cloudflare Pages untuk dynamic subdomain routing!

import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const GURU_DIR = path.resolve("guru");
const DIST_DIR = path.resolve("dist");
const OUT_DIR = path.resolve("out");
const HEADERS_SRC = path.resolve("public", "_headers");

// Pastikan dist bersih
if (fs.existsSync(DIST_DIR)) {
  fs.rmSync(DIST_DIR, { recursive: true, force: true });
}
fs.mkdirSync(DIST_DIR, { recursive: true });

// Cari semua folder guru
const daftarGuru = fs
  .readdirSync(GURU_DIR, { withFileTypes: true })
  .filter((dirent) => dirent.isDirectory())
  .map((dirent) => dirent.name);

if (daftarGuru.length === 0) {
  console.error("[X] Tidak ditemukan folder guru di folder 'guru/'");
  process.exit(1);
}

console.log(`[*] Ditemukan ${daftarGuru.length} guru: ${daftarGuru.join(", ")}`);

for (const guru of daftarGuru) {
  console.log(`\n==================================================`);
  console.log(`[*] Memproses build untuk guru: ${guru}`);
  console.log(`==================================================`);

  // 1. Bersihkan out folder
  if (fs.existsSync(OUT_DIR)) {
    fs.rmSync(OUT_DIR, { recursive: true, force: true });
  }

  // 2. Jalankan build Next.js SSG untuk guru ini
  execSync("npm run build", {
    stdio: "inherit",
    env: {
      ...process.env,
      GURU: guru,
    },
  });

  // 3. Salin out/ ke dist/<guru>/
  const targetDir = path.join(DIST_DIR, guru);
  fs.cpSync(OUT_DIR, targetDir, { recursive: true });

  // 4. Salin _headers ke dist/<guru>/ agar cache permanen aktif di Cloudflare Pages
  if (fs.existsSync(HEADERS_SRC)) {
    fs.copyFileSync(HEADERS_SRC, path.join(targetDir, "_headers"));
    console.log(`[OK] _headers (cache permanen) disalin ke dist/${guru}/`);
  }

  console.log(`[OK] Hasil build '${guru}' tersimpan di dist/${guru}/`);
}

console.log(`\n[OK] Seluruh materi guru siap di-deploy ke Cloudflare Pages dari folder 'dist/'.`);

