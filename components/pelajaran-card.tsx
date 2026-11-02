import Link from "next/link";
import { ArrowUpRight, BookOpen } from "lucide-react";
import type { PelajaranGroup } from "@/lib/content";

/** Class CSS per kelas — didefinisikan di globals.css, otomatis handle dark mode */
const kelasClass: Record<string, string> = {
  X:   "card-kelas-x",
  XI:  "card-kelas-xi",
  XII: "card-kelas-xii",
};

const kelasBadge: Record<string, string> = {
  X:   "badge-kelas-x",
  XI:  "badge-kelas-xi",
  XII: "badge-kelas-xii",
};

export default function PelajaranCard({
  pelajaran,
  index,
}: {
  pelajaran: PelajaranGroup;
  index?: number;
}) {
  const cardClass = pelajaran.kelas ? (kelasClass[pelajaran.kelas] ?? "") : "";
  const badgeClass = pelajaran.kelas ? (kelasBadge[pelajaran.kelas] ?? "bg-muted") : "bg-muted";

  return (
    <Link
      href={`/pelajaran/${pelajaran.slug}`}
      className={`neu-card group relative flex flex-col justify-between rounded-xl border-3 border-border p-5 sm:p-6 no-underline text-foreground neu-shadow transition-all duration-150 hover:-translate-y-1 hover:translate-x-1 overflow-hidden ${cardClass}`}
    >
      {/* Angka kelas membayang di sudut kanan bawah */}
      {pelajaran.kelas && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-3 bottom-1 select-none font-black text-foreground/[0.07] leading-none"
          style={{ fontSize: "clamp(4.5rem, 14vw, 6.5rem)" }}
        >
          {pelajaran.kelas}
        </span>
      )}

      <div className="relative flex items-center justify-between gap-3">
        {typeof index === "number" ? (
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

      <div className="relative pt-3 border-t-2 border-border/40 flex items-center justify-between text-xs font-bold text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <BookOpen className="size-3.5 stroke-[2.5]" />
          {pelajaran.daftarMateri.length} Materi Tersedia
        </span>
        {pelajaran.kelas && (
          <span className={`rounded border-2 border-border px-2 py-0.5 font-mono text-xs font-black text-foreground ${badgeClass}`}>
            Kelas {pelajaran.kelas}
          </span>
        )}
      </div>
    </Link>
  );
}

