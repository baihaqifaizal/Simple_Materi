import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";

export type Settings = {
  namaGuru: string;
  mapel: string;
  judulSitus: string;
  deskripsi: string;
  temaWarna: string;
};

export type MateriMeta = {
  slug: string;
  judul: string;
  tanggal: string | null;
  ringkasan: string;
};

export type Block = { type: "html"; html: string } | { type: "youtube"; id: string };

const ID_REG = /^[A-Za-z0-9_-]+$/;

function activeGuru(): string {
  return process.env.GURU ?? "boy";
}

function guruDir(guru: string): string {
  return path.resolve("guru", guru);
}

function stripPrefix(name: string): string {
  return name.replace(/^(\d+)-/, "");
}

function judulDariDokumen(isi: string): string {
  const baris = isi.split("\n").map((b) => b.trim());
  const heading = baris.find((b) => /^#\s+/.test(b));
  if (heading) return heading.replace(/^#\s+/, "").trim();
  return "";
}

function ringkasanDariDokumen(isi: string): string {
  const paragraf = isi
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p && !/^#\s+/.test(p) && !p.startsWith("!["));
  const pertama = paragraf[0] ?? "";
  const polos = pertama.replace(/\*\*|__|`/g, "").replace(/\n/, " ");
  return polos.length > 160 ? polos.slice(0, 157) + "..." : polos;
}

/** :::youtube <id-or-url> → div token; id tak valid dibuang tanpa jejak. */
function preprocessYoutube(isi: string): string {
  return isi.replace(
    /^\s*:::youtube\s+(\S+)\s*$/gm,
    (_cocok, token: string) => {
      const id = token.replace(/^.*(?:v=|youtu\.be\/|embed\/)/, "");
      return ID_REG.test(id) ? `<div data-youtube="${id}"></div>` : "";
    }
  );
}

function preprocessGambar(isi: string): string {
  return isi.replace(
    /(!\[[^\]]*\]\()(\s*)(gambar\/[^)\s]+)(\))/g,
    (_c, buka: string, sp: string, alamat: string) => `${buka}${sp}/gambar/${alamat.slice("gambar/".length)}${")"}`
  );
}

export function getSettings(guru: string): Settings {
  let data: Record<string, unknown> = {};
  try {
    const teks = fs.readFileSync(
      path.join(guruDir(guru), "settings.json"),
      "utf8"
    );
    data = JSON.parse(teks);
  } catch {
    // tanpa settings.json → default
  }
  return {
    namaGuru: typeof data.namaGuru === "string" ? data.namaGuru : guru,
    mapel: typeof data.mapel === "string" ? data.mapel : "",
    judulSitus: typeof data.judulSitus === "string" ? data.judulSitus : guru,
    deskripsi: typeof data.deskripsi === "string" ? data.deskripsi : "",
    temaWarna: typeof data.temaWarna === "string" ? data.temaWarna : "biru",
  };
}

export function listMateri(guru: string): MateriMeta[] {
  const dir = path.join(guruDir(guru), "md");
  if (!fs.existsSync(dir)) return [];
  const file = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .sort();
  return file.map((f) => {
    const slug = stripPrefix(f.slice(0, -3));
    const { data, content } = matter(
      fs.readFileSync(path.join(dir, f), "utf8")
    );
    return {
      slug,
      judul: typeof data.judul === "string" ? data.judul : judulDariDokumen(content) || slug,
      tanggal: typeof data.tanggal !== "undefined" ? String(data.tanggal) : null,
      ringkasan:
        typeof data.ringkasan === "string" ? data.ringkasan : ringkasanDariDokumen(content),
    };
  });
}

export function getMateri(
  guru: string,
  slug: string
): { meta: MateriMeta; blocks: Block[]; raw: string } | null {
  const dir = path.join(guruDir(guru), "md");
  if (!fs.existsSync(dir)) return null;
  const namaFile = fs
    .readdirSync(dir)
    .find((f) => f.endsWith(".md") && stripPrefix(f.slice(0, -3)) === slug);
  if (!namaFile) return null;
  const raw = fs.readFileSync(path.join(dir, namaFile), "utf8");
  const { data, content } = matter(raw);
  const diproses = preprocessGambar(preprocessYoutube(content));
  const html = marked.parse(diproses, { async: false }) as string;
  const blocks = pecahBlocks(html);
  return {
    meta: {
      slug,
      judul: typeof data.judul === "string" ? data.judul : judulDariDokumen(content) || slug,
      tanggal: typeof data.tanggal !== "undefined" ? String(data.tanggal) : null,
      ringkasan:
        typeof data.ringkasan === "string" ? data.ringkasan : ringkasanDariDokumen(content),
    },
    blocks,
    raw,
  };
}

const TOKEN = /<div data-youtube="([^"]*)"><\/div>/;

function pecahBlocks(html: string): Block[] {
  const blocks: Block[] = [];
  let sisa = html;
  while (sisa.length) {
    const m = sisa.match(TOKEN);
    if (!m) {
      const potongan = sisa.trim();
      if (potongan) blocks.push({ type: "html", html: potongan });
      break;
    }
    const sebelum = sisa.slice(0, m.index!).trim();
    if (sebelum) blocks.push({ type: "html", html: sebelum });
    blocks.push({ type: "youtube", id: m[1] });
    sisa = sisa.slice(m.index! + m[0].length);
  }
  return blocks;
}

export { activeGuru };
