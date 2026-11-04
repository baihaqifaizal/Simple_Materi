import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { listMateri, getMateri, getSettings, listGuru } from "./content";

// Fixture tatapan: guru/boy (dikomit), sisanya folder temporer yang dibuat & dibersihkan test.
const TMP = {
  anomali: path.resolve("guru/anomali"),
  kosong: path.resolve("guru/kosong"),
  konten: path.resolve("guru/uji-konten"),
  sintaks: path.resolve("guru/uji-sintaks"),
};

function mkGuruDir(name: string, mdContents: Record<string, string>) {
  fs.mkdirSync(path.join(name, "md"), { recursive: true });
  for (const [file, isi] of Object.entries(mdContents)) {
    fs.writeFileSync(path.join(name, "md", file), isi, "utf8");
  }
}

function mkGambar(guru: string, files: Record<string, string>) {
  for (const [file, isi] of Object.entries(files)) {
    const target = path.join(guru, "gambar", file);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, isi, "utf8");
  }
}

beforeAll(() => {
  mkGuruDir(TMP.anomali, {
    "01-x.md": "Halaman awal\n\n:::youtube aBc=99|xx\n",
  });
  mkGuruDir(TMP.kosong, {});

  mkGuruDir(TMP.konten, {
    "01-sistem-tata-surya.md": [
      "---",
      "judul: Sistem Tata Surya",
      "tanggal: 2026-01-02",
      "ringkasan: Pengenalan matahari dan planet.",
      "---",
      "",
      "# Sistem Tata Surya",
      "",
      "Matahari adalah pusat tata surya.",
      "",
      "![tata surya](gambar/sistem-tata-surya.svg)",
      "",
      ":::youtube dQw4w9WgXcQ",
      "",
      "Materi selesai.",
      "",
    ].join("\n"),
    "02-siapa-pak-boy.md": "# Siapa Pak Boy\n\nGuru seni musik.",
  });
  fs.writeFileSync(
    path.join(TMP.konten, "settings.json"),
    JSON.stringify({ namaGuru: "Uji Konten" }),
    "utf8"
  );
  mkGambar(TMP.konten, { "sistem-tata-surya.svg": "<svg/>" });

  mkGuruDir(TMP.sintaks, {
    "01-gambar.md": [
      "!Musik Teori.jpg",
      "",
      "!note.png",
      "",
      "!foto.webp",
      "",
      "!hilang.png",
      "",
      "- !sub/foto.svg",
      "",
    ].join("\n"),
    "02-gambar-lama.md": [
      "![musik](gambar/Musik Teori.jpeg)",
      "",
      "![webp](gambar/foto.webp)",
      "",
    ].join("\n"),
    "03-youtube.md": [
      "https://www.youtube.com/watch?v=J2aoEWRyb5Y&pp=ygULY2hlc3Qgdm9pY2U%3D",
      "",
      "https://youtu.be/aaaaaaaaaaa",
      "",
      "https://www.youtube.com/shorts/bbbbbbbbbbb",
      "",
      "https://example.com/video",
      "",
      ":::youtube https://youtu.be/ccccccccccc?t=10",
      "",
    ].join("\n"),
  });
  fs.writeFileSync(
    path.join(TMP.sintaks, "settings.json"),
    JSON.stringify({ namaGuru: "Uji Sintaks" }),
    "utf8"
  );
  mkGambar(TMP.sintaks, {
    "Musik Teori.jpeg": "jpeg",
    "note.png": "png",
    "foto.webp": "webp",
    "sub/foto.svg": "<svg/>",
  });
});

afterAll(() => {
  fs.rmSync(TMP.anomali, { recursive: true, force: true });
  fs.rmSync(TMP.kosong, { recursive: true, force: true });
  fs.rmSync(TMP.konten, { recursive: true, force: true });
  fs.rmSync(TMP.sintaks, { recursive: true, force: true });
});

describe("listMateri", () => {
  it("mengembalikan materi boy sesuai pelajaran di settings.json", () => {
    const daftar = listMateri("boy");
    expect(daftar.length).toBeGreaterThan(0);
    expect(daftar[0].slug).toBe("x_seni_7-elemen-musik");
  });

  it("mengembalikan array kosong bila md/ kosong", () => {
    expect(listMateri("kosong")).toEqual([]);
  });
});

describe("getMateri", () => {
  it("judul diambil dari frontmatter bila ada", () => {
    const materi = getMateri("uji-konten", "sistem-tata-surya");
    expect(materi?.meta.judul).toBe("Sistem Tata Surya");
    expect(materi?.meta.tanggal).not.toBeNull();
    expect(materi?.meta.ringkasan).toContain("Pengenalan matahari");
  });

  it("tanpa frontmatter: judul dari heading pertama", () => {
    const materi = getMateri("uji-konten", "siapa-pak-boy");
    expect(materi?.meta.judul).toBe("Siapa Pak Boy");
  });

  it("materi 01 punya 1 block youtube + minimal 2 block html", () => {
    const materi = getMateri("uji-konten", "sistem-tata-surya")!;
    const youtube = materi.blocks.filter((b) => b.type === "youtube");
    const html = materi.blocks.filter((b) => b.type === "html");
    expect(youtube).toHaveLength(1);
    expect(youtube[0]).toEqual({ type: "youtube", id: "dQw4w9WgXcQ" });
    expect(html.length).toBeGreaterThanOrEqual(2);
  });

  it("path gambar di-rewrite ke /gambar/...", () => {
    const materi = getMateri("uji-konten", "sistem-tata-surya")!;
    const semuaHtml = materi.blocks
      .map((b) => (b.type === "html" ? b.html : ""))
      .join("");
    expect(semuaHtml).toContain('src="/gambar/sistem-tata-surya.svg"');
  });

  it("id youtube tak valid dibuang, parse tetap sukses", () => {
    const materi = getMateri("anomali", "x")!;
    expect(materi.blocks.some((b) => b.type === "youtube")).toBe(false);
    expect(materi.blocks.length).toBeGreaterThan(0);
  });

  it("materi tak dikenal → null", () => {
    expect(getMateri("boy", "tak-ada")).toBeNull();
  });

  it("heading # pertama tidak dobel: tidak muncul di blok html", () => {
    for (const slug of ["sistem-tata-surya", "siapa-pak-boy"]) {
      const materi = getMateri("uji-konten", slug)!;
      const semua = materi.blocks
        .map((b) => (b.type === "html" ? b.html : ""))
        .join("");
      expect(semua).not.toMatch(/<h1[\s>]/);
    }
  });
});

describe("listGuru", () => {
  it("listGuru: guru dengan settings.json masuk, tanpa tidak", () => {
    fs.mkdirSync(path.resolve("guru/rapi"), { recursive: true });
    fs.writeFileSync(
      path.resolve("guru/rapi/settings.json"),
      JSON.stringify({ namaGuru: "Rapi", subdomain: "rapi" }),
      "utf8"
    );
    try {
      expect(listGuru().map((g) => g.namaGuru)).toContain("Boy");
      expect(listGuru().map((g) => g.namaGuru)).toContain("Rapi");
      expect(listGuru().map((g) => g.subdomain)).toContain("rapi");
    } finally {
      fs.rmSync(path.resolve("guru/rapi"), { recursive: true, force: true });
    }
  });
});

describe("getSettings", () => {
  it("membaca settings.json guru boy", () => {
    const s = getSettings("boy");
    expect(s.namaGuru).toBe("Boy");
    expect(s.fotoProfil).toBe("profile.jpg");
    expect(s.pemberitahuan).toBeDefined();
    expect(s.pelajaran?.length).toBeGreaterThan(0);
  });

  it("tanpa settings.json → fallback bernomor guru", () => {
    const s = getSettings("anonim");
    expect(s.namaGuru).toBe("anonim");
    expect(s.judulSitus).toBe("anonim");
  });
});

describe("sintaks gambar ringkas", () => {
  let diam: ReturnType<typeof vi.spyOn>;

  beforeAll(() => {
    diam = vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterAll(() => {
    diam.mockRestore();
  });

  it("!nama.jpg menemukan file .jpeg dan men-encode spasi", () => {
    const html = getMateri("uji-sintaks", "gambar")!.html;
    expect(html).toContain('src="/gambar/Musik%20Teori.jpeg"');
    expect(html).toContain('alt="Musik Teori"');
  });

  it("nama persis dan subfolder dipakai apa adanya", () => {
    const html = getMateri("uji-sintaks", "gambar")!.html;
    expect(html).toContain('src="/gambar/note.png"');
    expect(html).toContain('src="/gambar/sub/foto.svg"');
    expect(html).toContain('alt="foto"');
  });

  it("!nama.webp tampil sama seperti jpg/png", () => {
    const html = getMateri("uji-sintaks", "gambar")!.html;
    expect(html).toContain('src="/gambar/foto.webp"');
    expect(html).toContain('alt="foto"');
  });

  it("format lama dengan path .webp juga di-rewrite", () => {
    const html = getMateri("uji-sintaks", "gambar-lama")!.html;
    expect(html).toContain('src="/gambar/foto.webp"');
  });

  it("gambar yang tidak ada dibiarkan sebagai teks", () => {
    const html = getMateri("uji-sintaks", "gambar")!.html;
    expect(html).toContain("!hilang.png");
  });

  it("format lama dengan path berspasi tetap jadi /gambar/...", () => {
    const html = getMateri("uji-sintaks", "gambar-lama")!.html;
    expect(html).toContain('src="/gambar/Musik%20Teori.jpeg"');
  });
});

describe("URL YouTube baris sendiri", () => {
  it("URL watch dengan parameter jadi block youtube, URL lain tetap link", () => {
    const materi = getMateri("uji-sintaks", "youtube")!;
    const ids = materi.blocks
      .filter((b) => b.type === "youtube")
      .map((b) => b.id);
    expect(ids).toEqual([
      "J2aoEWRyb5Y",
      "aaaaaaaaaaa",
      "bbbbbbbbbbb",
      "ccccccccccc",
    ]);
    expect(materi.html).toContain("https://example.com/video");
  });
});

describe("peringatan md tak terdaftar", () => {
  const GURU = "uji-orphan";
  const dir = path.resolve("guru/uji-orphan");

  beforeAll(() => {
    fs.mkdirSync(path.join(dir, "md"), { recursive: true });
    fs.writeFileSync(
      path.join(dir, "settings.json"),
      JSON.stringify({
        namaGuru: "Uji Orphan",
        pelajaran: [
          {
            judul: "Pelajaran Uji",
            materi: [{ judulMateri: "Terdaftar", file: "01-terdaftar.md" }],
          },
        ],
      }),
      "utf8"
    );
    fs.writeFileSync(path.join(dir, "md", "01-terdaftar.md"), "# Terdaftar", "utf8");
    fs.writeFileSync(path.join(dir, "md", "liar.md"), "# Liar", "utf8");
  });

  afterAll(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it("memberi tahu file md yang tidak terdaftar di settings.json", () => {
    const diam = vi.spyOn(console, "warn").mockImplementation(() => {});
    try {
      getMateri(GURU, "terdaftar");
      const pesan = diam.mock.calls.flat().join(" ");
      expect(pesan).toContain("liar.md");
    } finally {
      diam.mockRestore();
    }
  });
});
