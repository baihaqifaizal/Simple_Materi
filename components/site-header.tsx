import Link from "next/link";
import { BookOpen } from "lucide-react";
import { activeGuru, getSettings } from "@/lib/content";
import ThemeToggle from "@/components/theme-toggle";

export default function SiteHeader() {
  const s = getSettings(activeGuru());
  return (
    <header className="sticky top-0 z-10 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-5 py-3">
        <Link
          href="/"
          className="flex min-h-11 items-center gap-2 no-underline transition-opacity hover:opacity-75"
        >
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
            <BookOpen className="size-4" />
          </span>
          <span>
            <span className="block text-sm font-bold leading-tight tracking-tight">
              {s.judulSitus}
            </span>
            {s.mapel ? (
              <span className="block text-[0.7rem] font-medium text-muted-foreground">
                {s.mapel}
              </span>
            ) : null}
          </span>
        </Link>
        <div className="min-h-11 flex items-center">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
