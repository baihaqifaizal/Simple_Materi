import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import MateriLoading from "./materi-loading";

describe("tampilan memuat materi", () => {
  const html = renderToStaticMarkup(<MateriLoading />);

  it("memberi status memuat yang terbaca screen reader", () => {
    expect(html).toContain('role="status"');
    expect(html).toContain("Memuat materi");
  });

  it("menampilkan beberapa bar equalizer beranimasi", () => {
    expect((html.match(/materi-bar/g) ?? []).length).toBeGreaterThanOrEqual(4);
  });
});
