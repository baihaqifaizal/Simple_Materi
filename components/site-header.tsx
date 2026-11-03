import Link from "next/link";
import { BookOpen } from "lucide-react";
import ThemeToggle from "@/components/theme-toggle";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b-2 border-border bg-background">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="group flex min-h-11 min-w-0 items-center gap-2.5 no-underline"
        >
          <span className="grid size-10 shrink-0 place-items-center rounded-md border-2 border-border bg-primary text-primary-foreground neu-shadow-sm transition-transform duration-150 group-hover:translate-x-0.5 group-hover:translate-y-0.5">
            <BookOpen className="size-5 stroke-[2.5]" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-base font-extrabold tracking-tight text-foreground">
              Materi
            </span>
            <span className="block truncate text-xs font-bold text-muted-foreground">
              MA Nurul Hidayah Majalangu
            </span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
