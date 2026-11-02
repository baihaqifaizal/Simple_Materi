"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { youtubeEmbedUrl, youtubeThumbUrl } from "@/lib/youtube";

/**
 * Embed YouTube malas: thumbnail dulu, iframe dibuat hanya saat diklik
 */
export default function YouTubeEmbed({ id, judul }: { id: string; judul?: string }) {
  const [nyala, setNyala] = useState(false);

  if (nyala) {
    return (
      <div className="aspect-video w-[calc(100%-1px)] overflow-hidden rounded-lg border-2 border-border neu-shadow my-6">
        <iframe
          width="100%"
          height="100%"
          src={youtubeEmbedUrl(id)}
          title={judul ?? id}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          loading="lazy"
          className="w-full h-full"
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setNyala(true)}
      aria-label={judul ? `Tonton video: ${judul}` : "Tonton video materi"}
      className="neu-btn group relative block aspect-video w-[calc(100%-1px)] overflow-hidden rounded-lg border-2 border-border bg-card bg-center bg-cover my-6"
      style={{ backgroundImage: `url(${youtubeThumbUrl(id)})` }}
    >
      <span className="absolute inset-0 grid place-items-center bg-black/25 transition-colors group-hover:bg-black/35">
        <span className="grid size-14 place-items-center rounded-lg border-2 border-border bg-primary text-primary-foreground neu-shadow transition-transform duration-150 group-hover:scale-105">
          <Play className="size-6 translate-x-[2px] stroke-[2.5]" fill="currentColor" />
        </span>
      </span>
    </button>
  );
}
