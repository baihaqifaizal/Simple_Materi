import { describe, expect, it } from "vitest";
import { youtubeThumbUrl, youtubeEmbedUrl } from "./youtube";

describe("URL YouTube", () => {
  it("thumbnail dari i.ytimg.com", () => {
    expect(youtubeThumbUrl("dQw4w9WgXcQ")).toBe(
      "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg"
    );
  });

  it("embed pakai youtube-nocookie dengan rel=0 & autoplay=1", () => {
    expect(youtubeEmbedUrl("dQw4w9WgXcQ")).toBe(
      "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0&autoplay=1"
    );
  });
});
