"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { youtubeEmbedUrl, youtubeThumbUrl } from "@/lib/youtube";

/**
 * Embed YouTube malas: thumbnail dulu, iframe dibuat hanya saat diklik —
 * 20 video termasuk tidak melambatmuaran halaman.
 */
export default function YouTubeEmbed({ id, judul }: { id: string; judul?: string }) {
  const [nyala, setNyala] = useState(false);

  if (nyala) {
    return (
      <div className="aspect-video w-[calc(100%-1px)] overflow-hidden rounded-xl">
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
      aria-label={judul ? `Tonton video: ${judul}` : "Tonton video"}
      className="group relative block aspect-video w-[calc(100%-1px)] overflow-hidden rounded-xl border border-border bg-center bg-cover transition-opacity hover:opacity-95"
      style={{ backgroundImage: `url(${youtubeThumbUrl(id)})` }}
    >
      <span className="absolute inset-0 grid place-items-center">
        <span className="grid size-14 place-items-center rounded-full bg-black/70 text-white shadow-lg transition-transform duration-200 group-hover:scale-105">
          <Play className="size-6 translate-x-[2px]" fill="currentColor" />
        </span>
      </span>
    </button>
  );
}
