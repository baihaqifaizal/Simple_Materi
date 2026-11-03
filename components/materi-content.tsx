"use client";

import { useEffect, useRef } from "react";
import { createRoot, Root } from "react-dom/client";
import YouTubeEmbed from "@/components/youtube-embed";

export default function MateriContent({
  html,
  judul,
}: {
  html: string;
  judul?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const roots: Root[] = [];

    // Cari semua placeholder youtube yang dirender di dalam html (termasuk di dalam details/toggle)
    const placeholders = containerRef.current.querySelectorAll<HTMLElement>(
      'div[data-youtube]'
    );

    placeholders.forEach((el) => {
      const id = el.getAttribute("data-youtube");
      if (id) {
        const root = createRoot(el);
        root.render(<YouTubeEmbed id={id} judul={judul} />);
        roots.push(root);
      }
    });

    return () => {
      roots.forEach((root) => {
        try {
          root.unmount();
        } catch {
          // ignore unmount errors on fast navigate
        }
      });
    };
  }, [html, judul]);

  return (
    <div
      ref={containerRef}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

