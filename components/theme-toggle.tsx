"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

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
      // abaikan
    }
    setGelap(jadi);
  }

  return (
    <button
      type="button"
      onClick={gantiTema}
      aria-label={gelap ? "Ganti ke mode terang" : "Ganti ke mode gelap"}
      className="neu-btn grid size-10 place-items-center rounded-md bg-card text-foreground"
    >
      {gelap === null ? null : gelap ? (
        <Sun className="size-4 stroke-[2.5]" />
      ) : (
        <Moon className="size-4 stroke-[2.5]" />
      )}
    </button>
  );
}
