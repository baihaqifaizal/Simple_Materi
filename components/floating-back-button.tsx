"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface FloatingBackButtonProps {
  href: string;
  label: string;
}

export default function FloatingBackButton({ href, label }: FloatingBackButtonProps) {
  const [isStickyVisible, setIsStickyVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollingUp = currentScrollY < lastScrollY.current;

      // Cek apakah posisi tombol statis default di atas dokumen sudah keluar dari viewport
      const topOffset = containerRef.current
        ? containerRef.current.offsetTop + containerRef.current.offsetHeight
        : 120;

      const isPastDefaultButton = currentScrollY > topOffset;

      // Muncul menempel (sticky) jika user scroll ke atas dan posisi tombol default sudah terlewati
      if (scrollingUp && isPastDefaultButton) {
        setIsStickyVisible(true);
      } else {
        setIsStickyVisible(false);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div ref={containerRef} className="relative z-40">
      {/* Tombol statis default di posisi kiri konten */}
      <Link
        href={href}
        className="neu-btn inline-flex min-h-11 items-center gap-2 rounded-md bg-card px-4 py-2 text-xs font-black uppercase text-foreground no-underline"
      >
        <ArrowLeft className="size-4 stroke-[2.5]" />
        {label}
      </Link>

      {/* Tombol sticky yang menempel tepat sejajar di posisi kiri konten saat scroll naik dengan jarak lega dari header */}
      <div
        className={`pointer-events-none fixed top-[4.5rem] left-0 right-0 z-40 transition-all duration-300 ease-out pt-3 sm:pt-4 ${
          isStickyVisible
            ? "translate-y-0 opacity-100"
            : "-translate-y-4 opacity-0"
        }`}
      >
        <div className="mx-auto w-full max-w-3xl px-4 sm:px-6">
          <Link
            href={href}
            className={`neu-btn pointer-events-auto inline-flex min-h-11 items-center gap-2 rounded-md bg-card px-4 py-2 text-xs font-black uppercase text-foreground no-underline neu-shadow transition-transform hover:scale-105 active:scale-95 ${
              !isStickyVisible ? "pointer-events-none" : ""
            }`}
            aria-hidden={!isStickyVisible}
            tabIndex={isStickyVisible ? 0 : -1}
          >
            <ArrowLeft className="size-4 stroke-[2.5]" />
            {label}
          </Link>
        </div>
      </div>
    </div>
  );
}
