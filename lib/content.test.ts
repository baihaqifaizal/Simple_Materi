import { afterAll, beforeAll, describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { listMateri, getMateri, getSettings, listGuru } from "./content";

// Fixture tatapan: guru/boy (dikomit), sisanya folder temporer yang dibuat & dibersihkan test.
const TMP = {
  anomali: path.resolve("guru/anomali"),
  kosong: path.resolve("guru/kosong"),
};

function mkGuruDir(name: string, mdContents: Record<string, string>) {
  fs.mkdirSync(path.join(name, "md"), { recursive: true });
  for (const [file, isi] of Object.entries(mdContents)) {
    fs.writeFileSync(path.join(name, "md", file), isi, "utf8");
  }
}

beforeAll(() => {
  mkGuruDir(TMP.anomali, {
    "01-x.md": "Halaman awal\n\n:::youtube aBc=99|xx\n",
  });
  mkGuruDir(TMP.kosong, {});
});

afterAll(() => {
  fs.rmSync(TMP.anomali, { recursive: true, force: true });
  fs.rmSync(TMP.kosong, { recursive: true, force: true });
});

describe("listMateri", () => {
  it("mengembalikan materi boy sesuai pelajaran di settings.json", () => {
    const daftar = listMateri("boy");
    expect(daftar.length).toBeGreaterThan(0);
    expect(daftar[0].slug).toBe("seni-x-sem1-7-elemen-musik");
  });

  it("mengembalikan array kosong bila md/ kosong", () => {
    expect(listMateri("kosong")).toEqual([]);
  });
});

describe("getMateri", () => {
  it("judul diambil dari frontmatter bila ada", () => {
    const materi = getMateri("boy", "sistem-tata-surya");
    expect(materi?.meta.judul).toBe("Sistem Tata Surya");
    expect(materi?.meta.tanggal).not.toBeNull();
    expect(materi?.meta.ringkasan).toContain("Pengenalan matahari");
  });

  it("tanpa frontmatter: judul dari heading pertama", () => {
    const materi = getMateri("boy", "siapa-pak-boy");
    expect(materi?.meta.judul).toBe("Siapa Pak Boy");
  });

  it("materi 01 punya 1 block youtube + minimal 2 block html", () => {
    const materi = getMateri("boy", "sistem-tata-surya")!;
    const youtube = materi.blocks.filter((b) => b.type === "youtube");
    const html = materi.blocks.filter((b) => b.type === "html");
    expect(youtube).toHaveLength(1);
    expect(youtube[0]).toEqual({ type: "youtube", id: "dQw4w9WgXcQ" });
    expect(html.length).toBeGreaterThanOrEqual(2);
  });

  it("path gambar di-rewrite ke /gambar/...", () => {
    const materi = getMateri("boy", "sistem-tata-surya")!;
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
      const materi = getMateri("boy", slug)!;
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
