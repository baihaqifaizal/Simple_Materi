"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { createRoot, Root } from "react-dom/client";
import { X } from "lucide-react";
import YouTubeEmbed from "@/components/youtube-embed";

type GambarBesar = { src: string; alt: string };

export default function MateriContent({
  html,
  judul,
}: {
  html: string;
  judul?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [gambarBesar, setGambarBesar] = useState<GambarBesar | null>(null);
  const tombolTutupRef = useRef<HTMLButtonElement>(null);
  const fokusSebelumnya = useRef<HTMLElement | null>(null);

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

  // Event delegation: semua <img> di dalam materi bisa diketuk untuk diperbesar.
  useEffect(() => {
    const wadah = containerRef.current;
    if (!wadah) return;

    const klik = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const gambar = target.closest("img");
      if (!gambar || !wadah.contains(gambar)) return;

      event.preventDefault();
      fokusSebelumnya.current = document.activeElement as HTMLElement | null;
      setGambarBesar({
        src: gambar.getAttribute("src") ?? "",
        alt: gambar.getAttribute("alt") ?? "",
      });
    };

    wadah.addEventListener("click", klik);
    return () => wadah.removeEventListener("click", klik);
  }, [html]);

  // Saat perbesaran terbuka: fokus ke tombol tutup, kunci scroll, Esc menutup.
  useEffect(() => {
    if (!gambarBesar) return;

    tombolTutupRef.current?.focus();

    const kunci = (event: KeyboardEvent) => {
      if (event.key === "Escape") setGambarBesar(null);
    };
    const overflowAsal = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", kunci);

    return () => {
      document.removeEventListener("keydown", kunci);
      document.body.style.overflow = overflowAsal;
      fokusSebelumnya.current?.focus?.();
    };
  }, [gambarBesar]);

  return (
    <>
      <div ref={containerRef} dangerouslySetInnerHTML={{ __html: html }} />

      {gambarBesar &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={
              gambarBesar.alt
                ? `Perbesar gambar: ${gambarBesar.alt}`
                : "Perbesar gambar"
            }
            className="fixed inset-0 z-[100] grid place-items-center bg-black/80 p-3 backdrop-blur-sm sm:p-6"
            onClick={() => setGambarBesar(null)}
          >
            <button
              ref={tombolTutupRef}
              type="button"
              aria-label="Tutup perbesaran gambar"
              onClick={(event) => {
                event.stopPropagation();
                setGambarBesar(null);
              }}
              className="absolute right-3 top-3 inline-flex size-11 items-center justify-center rounded-lg border-3 border-border bg-card text-foreground neu-shadow transition-transform hover:scale-105 sm:right-5 sm:top-5"
            >
              <X className="size-5 stroke-[2.5]" />
            </button>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={gambarBesar.src}
              alt={gambarBesar.alt}
              onClick={(event) => event.stopPropagation()}
              className="max-h-[90dvh] max-w-[96vw] cursor-default rounded-lg border-3 border-border bg-card object-contain shadow-2xl"
            />
          </div>,
          document.body
        )}
    </>
  );
}
