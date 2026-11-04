// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import MateriContent from "./materi-content";

afterEach(cleanup);

const HTML =
  '<p><img src="/gambar/Musik%20Teori.jpeg" alt="Musik Teori"></p>';

function bukaPerbesaran() {
  render(<MateriContent html={HTML} judul="Uji" />);
  fireEvent.click(screen.getByAltText("Musik Teori"));
  return screen.getByRole("dialog", { name: /Musik Teori/ });
}

describe("perbesar gambar", () => {
  it("klik gambar membuka tampilan besar dengan src yang sama", () => {
    const dialog = bukaPerbesaran();
    const besar = dialog.querySelector("img");
    expect(besar?.getAttribute("src")).toBe("/gambar/Musik%20Teori.jpeg");
  });

  it("tombol tutup menutup tampilan besar", () => {
    bukaPerbesaran();
    fireEvent.click(screen.getByRole("button", { name: /tutup/i }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("klik area gelap menutup tampilan besar", () => {
    const dialog = bukaPerbesaran();
    fireEvent.click(dialog);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("klik gambar besar tidak menutup", () => {
    const dialog = bukaPerbesaran();
    fireEvent.click(dialog.querySelector("img")!);
    expect(screen.queryByRole("dialog")).not.toBeNull();
  });

  it("tombol Escape menutup tampilan besar", () => {
    bukaPerbesaran();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
