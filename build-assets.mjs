// Salin gambar guru aktif → public/gambar (nama file dipertahankan, rekursif).
import fs from "node:fs";
import path from "node:path";

const guru = process.env.GURU ?? "boy";
const sumber = path.resolve("guru", guru, "gambar");
const sasaran = path.resolve("public", "gambar");

try {
  await fs.promises.cp(sumber, sasaran, { recursive: true });
} catch (err) {
  if (err?.code === "ENOENT") {
    console.warn(`[] tidak ada folder gambar untuk guru "${guru}"`);
    process.exit(0);
  }
  throw err;
}
