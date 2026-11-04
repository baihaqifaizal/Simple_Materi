import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import PelajaranLoading from "./pelajaran-loading";

describe("tampilan memuat pelajaran", () => {
  const html = renderToStaticMarkup(<PelajaranLoading />);

  it("memberi status memuat yang terbaca screen reader", () => {
    expect(html).toContain('role="status"');
    expect(html).toContain("Memuat pelajaran");
  });

  it("menampilkan beberapa bar equalizer beranimasi", () => {
    expect((html.match(/materi-bar/g) ?? []).length).toBeGreaterThanOrEqual(4);
  });
});
