import { afterAll, beforeAll, expect, it } from "vitest";
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const fixture = path.resolve("guru/aset-uji");
const target = path.resolve("public/gambar");

beforeAll(() => {
  fs.mkdirSync(path.join(fixture, "gambar", "sub"), { recursive: true });
  fs.writeFileSync(
    path.join(fixture, "settings.json"),
    JSON.stringify({ namaGuru: "Uji" }),
    "utf8"
  );
  fs.writeFileSync(path.join(fixture, "gambar", "a.svg"), "<svg/>", "utf8");
  fs.writeFileSync(path.join(fixture, "gambar", "c.webp"), "webp", "utf8");
  fs.writeFileSync(path.join(fixture, "gambar", "sub", "b.png"), "xx", "utf8");
  // hanya bersihkan target milik fixture, jangan seluruh public/gambar
  fs.rmSync(path.join(target, "a.svg"), { force: true });
  fs.rmSync(path.join(target, "c.webp"), { force: true });
  fs.rmSync(path.join(target, "sub"), { recursive: true, force: true });
});

afterAll(() => {
  fs.rmSync(fixture, { recursive: true, force: true });
  // hanya bersihkan jejak fixture, jangan seluruh public/gambar
  fs.rmSync(path.join(target, "a.svg"), { force: true });
  fs.rmSync(path.join(target, "c.webp"), { force: true });
  fs.rmSync(path.join(target, "sub"), { recursive: true, force: true });
});

it("menyalin gambar guru aktif (rekursif) ke public/gambar", () => {
  execSync("node build-assets.mjs", {
    encoding: "utf8",
    env: { ...process.env, GURU: "aset-uji" },
  });
  expect(fs.existsSync(path.join(target, "a.svg"))).toBe(true);
  expect(fs.existsSync(path.join(target, "c.webp"))).toBe(true);
  expect(fs.existsSync(path.join(target, "sub", "b.png"))).toBe(true);
});
