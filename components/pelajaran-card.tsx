import Link from "next/link";
import { ArrowUpRight, BookOpen } from "lucide-react";
import type { PelajaranGroup } from "@/lib/content";

/** Class CSS per kelas — didefinisikan di globals.css, otomatis handle dark mode */
const kelasClass: Record<string, string> = {
  X:   "card-kelas-x",
  XI:  "card-kelas-xi",
  XII: "card-kelas-xii",
};

export default function PelajaranCard({
  pelajaran,
  index,
}: {
  pelajaran: PelajaranGroup;
  index?: number;
}) {
  const cardClass = pelajaran.kelas ? (kelasClass[pelajaran.kelas] ?? "") : "";

  return (
    <Link
      href={`/pelajaran/${pelajaran.slug}`}
      className={`neu-card group relative flex flex-col justify-between rounded-xl border-3 border-border p-5 sm:p-6 no-underline text-foreground neu-shadow transition-all duration-150 hover:-translate-y-1 hover:translate-x-1 overflow-hidden ${cardClass}`}
    >
      {/* Angka kelas besar membayang di sudut kanan bawah */}
      {pelajaran.kelas && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-2 -bottom-2 select-none font-black text-foreground/[0.14] dark:text-foreground/[0.16] leading-none tracking-tighter"
          style={{ fontSize: "clamp(5rem, 16vw, 7.5rem)" }}
        >
          {pelajaran.kelas}
        </span>
      )}

      <div className="relative flex items-center justify-between gap-3">
        {pelajaran.kelas ? (
          <span className="inline-block rounded border-2 border-border bg-primary px-2.5 py-0.5 font-mono text-xs font-black text-primary-foreground">
            Kelas {pelajaran.kelas}
          </span>
        ) : typeof index === "number" ? (
          <span className="inline-block rounded border-2 border-border bg-primary px-2.5 py-0.5 font-mono text-xs font-black text-primary-foreground">
            #{String(index + 1).padStart(2, "0")}
          </span>
        ) : <span />}

        <span className="inline-flex items-center gap-1 text-xs font-black uppercase text-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
          Buka
          <ArrowUpRight className="size-4 stroke-[2.5]" />
        </span>
      </div>

      <div className="relative my-3">
        <h2 className="text-xl sm:text-2xl font-black leading-snug tracking-tight text-foreground transition-colors group-hover:text-primary">
          {pelajaran.judul}
        </h2>
      </div>

      <div className="relative pt-1 flex items-center justify-between text-xs font-bold text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <BookOpen className="size-3.5 stroke-[2.5]" />
          {pelajaran.daftarMateri.length} BAB
        </span>
      </div>
    </Link>
  );
}

