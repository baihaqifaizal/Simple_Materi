"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Toggle gelap/terang. Keputusan awal sudah di-set script layout;
 * komponen ini hanya membaca ulang kondisi kelas saat bisu mount.
 */
export default function ThemeToggle() {
  const [gelap, setGelap] = useState<boolean | null>(null);

  useEffect(() => {
    setGelap(document.documentElement.classList.contains("dark"));
  }, []);

  function gantiTema() {
    const jadi = !gelap;
    document.documentElement.classList.toggle("dark", jadi);
    try {
      localStorage.setItem("tema", jadi ? "dark" : "light");
    } catch {
      // abaikan: localStorage mungkin ditutup
    }
    setGelap(jadi);
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={gantiTema}
      aria-label={gelap ? "Ganti ke terang" : "Ganti ke gelap"}
      className="rounded-lg text-muted-foreground hover:text-foreground"
    >
      {gelap === null ? null : gelap ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  );
}
