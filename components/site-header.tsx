import Link from "next/link";
import { activeGuru, getSettings } from "@/lib/content";

export default function SiteHeader() {
  const s = getSettings(activeGuru());
  return (
    <header className="sticky top-0 z-10 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-5 py-3.5 min-h-11">
        <Link href="/" className="text-[0.95rem] font-bold tracking-tight no-underline hover:opacity-80">
          {s.judulSitus}
        </Link>
        <span className="text-xs text-muted-foreground">{s.mapel}</span>
      </div>
    </header>
  );
}
