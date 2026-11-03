import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";

export type MateriItemSetting = {
  judulMateri: string;
  file: string;
};

export type PelajaranSetting = {
  judul: string;
  kelas?: string;
  visible?: "active" | "hidden" | string;
  slug?: string;
  materi: MateriItemSetting[];
};

export type Settings = {
  namaGuru: string;
  judulSitus: string;
  deskripsi: string;
  temaWarna: string;
  fotoProfil?: string;
  pemberitahuan?: string;
  pelajaran?: PelajaranSetting[];
};

export type MateriMeta = {
  slug: string;
  judul: string;
  tanggal: string | null;
  ringkasan: string;
  file?: string;
  pelajaranJudul?: string;
  pelajaranSlug?: string;
};

export type PelajaranGroup = {
  judul: string;
  kelas?: string;
  visible?: string;
  slug: string;
  daftarMateri: MateriMeta[];
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

function fileToSlug(fileName: string): string {
  const cleanName = fileName.endsWith(".md") ? fileName.slice(0, -3) : fileName;
  return stripPrefix(cleanName);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function judulDariDokumen(isi: string): string {
  const baris = isi.split("\n").map((b) => b.trim());
  const heading = baris.find((b) => /^#\s+/.test(b));
  if (heading) return heading.replace(/^#\s+/, "").trim();
  return "";
}

/** Heading H1 pertama = judul halaman; jangan dobel di isi. */
function pangkasHeadingPertama(isi: string): string {
  const baris = isi.split("\n");
  const idx = baris.findIndex((b) => b.trim() !== "");
  if (idx >= 0 && /^#\s+/.test(baris[idx].trim())) {
    baris.splice(idx, 1);
    return baris.join("\n");
  }
  return isi;
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
      return ID_REG.test(id) ? `\n\n<div data-youtube="${id}"></div>\n\n` : "";
    }
  );
}

function preprocessGambar(isi: string): string {
  return isi.replace(
    /(!\[[^\]]*\]\()(\s*)(gambar\/[^)\s]+)(\))/g,
    (_c, buka: string, sp: string, alamat: string) => `${buka}${sp}/gambar/${alamat.slice("gambar/".length)}${")"}`
  );
}

/**
 * Mengubah setiap bagian `# Heading` menjadi collapsible toggle `<details><summary>`
 * Bagian sebelum `#` pertama tetap di luar details.
 */
function preprocessCollapsibleHeading(isi: string): string {
  const lines = isi.split(/\r?\n/);
  const result: string[] = [];
  let inDetails = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(/^#\s+(.+)$/);

    if (match) {
      if (inDetails) {
        result.push("");
        result.push("</div>");
        result.push("</details>");
        result.push("");
      }
      // Bersihkan format bold/italic seperti **judul** di summary
      const rawTitle = match[1].trim();
      const cleanTitle = rawTitle.replace(/\*\*/g, "").replace(/__/g, "").trim();
      result.push("");
      result.push(`<details class="materi-toggle">`);
      result.push(`<summary class="materi-toggle-summary"><span>${cleanTitle}</span></summary>`);
      result.push(`<div class="materi-toggle-content">`);
      result.push("");
      inDetails = true;
    } else {
      result.push(line);
    }
  }

  if (inDetails) {
    result.push("");
    result.push("</div>");
    result.push("</details>");
  }

  return result.join("\n");
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

  let pelajaran: PelajaranSetting[] | undefined;
  if (Array.isArray(data.pelajaran)) {
    pelajaran = data.pelajaran.map((p: any) => {
      const judul = typeof p.judul === "string" ? p.judul : "Pelajaran";
      const slug = typeof p.slug === "string" && p.slug ? p.slug : slugify(judul);
      const kelas = typeof p.kelas === "string" ? p.kelas : undefined;
      const visible = typeof p.visible === "string" ? p.visible : "active";
      const materiList: MateriItemSetting[] = Array.isArray(p.materi)
        ? p.materi.filter((m: any) => m && typeof m.file === "string")
            .map((m: any) => ({
              judulMateri: typeof m.judulMateri === "string" ? m.judulMateri : (typeof m.judul === "string" ? m.judul : fileToSlug(m.file)),
              file: m.file,
            }))
        : [];
      return {
        judul,
        kelas,
        visible,
        slug,
        materi: materiList,
      };
    });
  }

  return {
    namaGuru: typeof data.namaGuru === "string" ? data.namaGuru : guru,
    judulSitus: typeof data.judulSitus === "string" ? data.judulSitus : guru,
    deskripsi: typeof data.deskripsi === "string" ? data.deskripsi : "",
    temaWarna: typeof data.temaWarna === "string" ? data.temaWarna : "biru",
    fotoProfil: typeof data.fotoProfil === "string" ? data.fotoProfil : undefined,
    pemberitahuan: typeof data.pemberitahuan === "string" ? data.pemberitahuan : undefined,
    pelajaran,
  };
}

export type GuruTersedia = { namaGuru: string; subdomain: string };

/** Semua guru (= folder guru/* yang punya settings.json), urut abjad. */
export function listGuru(): GuruTersedia[] {
  if (!fs.existsSync("guru")) return [];
  return fs
    .readdirSync("guru", { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .filter((d) => fs.existsSync(path.join("guru", d.name, "settings.json")))
    .map((d) => ({ subdomain: d.name, ...getSettings(d.name) }))
    .sort((a, b) => a.subdomain.localeCompare(b.subdomain));
}

/** Mengambil pelajaran terkelompok */
export function listPelajaran(guru: string): PelajaranGroup[] {
  const dir = path.join(guruDir(guru), "md");
  const settings = getSettings(guru);

  if (settings.pelajaran && settings.pelajaran.length > 0) {
    return settings.pelajaran
      .filter((pel) => pel.visible !== "hidden")
      .map((pel) => {
        const pSlug = pel.slug || slugify(pel.judul);
      const daftarMateri: MateriMeta[] = pel.materi.map((item) => {
        const slug = fileToSlug(item.file);
        const targetPath = path.join(dir, item.file);

        let tanggal: string | null = null;
        let ringkasan = "";
        let finalJudul = item.judulMateri;

        if (fs.existsSync(targetPath)) {
          const { data, content } = matter(fs.readFileSync(targetPath, "utf8"));
          tanggal = typeof data.tanggal !== "undefined" ? String(data.tanggal) : null;
          ringkasan = typeof data.ringkasan === "string" ? data.ringkasan : ringkasanDariDokumen(content);
          if (!finalJudul) {
            finalJudul = typeof data.judul === "string" ? data.judul : judulDariDokumen(content) || slug;
          }
        }

        return {
          slug,
          judul: finalJudul,
          tanggal,
          ringkasan,
          file: item.file,
          pelajaranJudul: pel.judul,
          pelajaranSlug: pSlug,
        };
      });

      return {
        judul: pel.judul,
        kelas: pel.kelas,
        slug: pSlug,
        daftarMateri,
      };
    });
  }

  // Fallback jika tidak ada pelajaran di settings
  const allMateri = listMateri(guru);
  return [
    {
      judul: "Semua Pelajaran",
      slug: "semua",
      daftarMateri: allMateri,
    },
  ];
}

export function getPelajaran(guru: string, slug: string): PelajaranGroup | null {
  const daftar = listPelajaran(guru);
  return daftar.find((p) => p.slug === slug) ?? null;
}

/** Mengembalikan daftar flat semua materi untuk sitemap / generateStaticParams */
export function listMateri(guru: string): MateriMeta[] {
  const dir = path.join(guruDir(guru), "md");
  if (!fs.existsSync(dir)) return [];

  const settings = getSettings(guru);

  if (settings.pelajaran && settings.pelajaran.length > 0) {
    const list: MateriMeta[] = [];
    for (const pel of settings.pelajaran) {
      if (pel.visible === "hidden") continue;
      const pSlug = pel.slug || slugify(pel.judul);
      for (const item of pel.materi) {
        const slug = fileToSlug(item.file);
        const targetPath = path.join(dir, item.file);

        let tanggal: string | null = null;
        let ringkasan = "";
        let finalJudul = item.judulMateri;

        if (fs.existsSync(targetPath)) {
          const { data, content } = matter(fs.readFileSync(targetPath, "utf8"));
          tanggal = typeof data.tanggal !== "undefined" ? String(data.tanggal) : null;
          ringkasan = typeof data.ringkasan === "string" ? data.ringkasan : ringkasanDariDokumen(content);
          if (!finalJudul) {
            finalJudul = typeof data.judul === "string" ? data.judul : judulDariDokumen(content) || slug;
          }
        }

        list.push({
          slug,
          judul: finalJudul,
          tanggal,
          ringkasan,
          file: item.file,
          pelajaranJudul: pel.judul,
          pelajaranSlug: pSlug,
        });
      }
    }
    return list;
  }

  // Fallback membaca seluruh folder md jika tidak didaftarkan di settings.json
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .sort();

  return files.map((f) => {
    const slug = fileToSlug(f);
    const { data, content } = matter(
      fs.readFileSync(path.join(dir, f), "utf8")
    );
    return {
      slug,
      judul: typeof data.judul === "string" ? data.judul : judulDariDokumen(content) || slug,
      tanggal: typeof data.tanggal !== "undefined" ? String(data.tanggal) : null,
      ringkasan:
        typeof data.ringkasan === "string" ? data.ringkasan : ringkasanDariDokumen(content),
      file: f,
    };
  });
}

export function getMateri(
  guru: string,
  slug: string
): { meta: MateriMeta; blocks: Block[]; html: string; raw: string } | null {
  const dir = path.join(guruDir(guru), "md");
  if (!fs.existsSync(dir)) return null;

  const settings = getSettings(guru);
  let targetFile: string | undefined;
  let customJudul: string | undefined;
  let pelajaranJudul: string | undefined;
  let pelajaranSlug: string | undefined;

  // Cek jika slug dicocokkan dari pelajaran di settings
  if (settings.pelajaran) {
    for (const pel of settings.pelajaran) {
      if (pel.visible === "hidden") continue;
      const matched = pel.materi.find((item) => fileToSlug(item.file) === slug);
      if (matched) {
        targetFile = matched.file;
        customJudul = matched.judulMateri;
        pelajaranJudul = pel.judul;
        pelajaranSlug = pel.slug || slugify(pel.judul);
        break;
      }
    }
  }

  // Fallback pencarian file di folder md
  if (!targetFile) {
    targetFile = fs
      .readdirSync(dir)
      .find((f) => f.endsWith(".md") && fileToSlug(f) === slug);
  }

  if (!targetFile || !fs.existsSync(path.join(dir, targetFile))) return null;

  const raw = fs.readFileSync(path.join(dir, targetFile), "utf8");
  const { data, content } = matter(raw);
  const diproses = preprocessGambar(
    preprocessYoutube(preprocessCollapsibleHeading(pangkasHeadingPertama(content)))
  );
  const html = marked.parse(diproses, { async: false }) as string;
  const blocks = pecahBlocks(html);

  const finalJudul = customJudul || (typeof data.judul === "string" ? data.judul : judulDariDokumen(content) || slug);

  return {
    meta: {
      slug,
      judul: finalJudul,
      tanggal: typeof data.tanggal !== "undefined" ? String(data.tanggal) : null,
      ringkasan:
        typeof data.ringkasan === "string" ? data.ringkasan : ringkasanDariDokumen(content),
      file: targetFile,
      pelajaranJudul,
      pelajaranSlug,
    },
    blocks,
    html,
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
