import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { MateriMeta } from "@/lib/content";

export default function MateriCard({
  materi,
  index,
}: {
  materi: MateriMeta;
  index?: number;
}) {
  return (
    <Link
      href={`/materi/${materi.slug}`}
      className="neu-card group flex flex-col justify-between rounded-xl bg-card border-3 border-border p-5 sm:p-6 no-underline text-foreground neu-shadow transition-all duration-150 hover:-translate-y-1 hover:translate-x-1"
    >
      <div className="flex items-center justify-between gap-3">
        {typeof index === "number" ? (
          <span className="inline-block rounded border-2 border-border bg-primary px-2.5 py-0.5 font-mono text-xs font-black text-primary-foreground">
            #{String(index + 1).padStart(2, "0")}
          </span>
        ) : <span />}

        <span className="inline-flex items-center gap-1 text-xs font-black uppercase text-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
          Buka Materi
          <ArrowUpRight className="size-4 stroke-[2.5]" />
        </span>
      </div>

      <div className="mt-3">
        <h2 className="text-lg sm:text-xl font-black leading-snug tracking-tight text-foreground transition-colors group-hover:text-primary">
          {materi.judul}
        </h2>
      </div>
    </Link>
  );
}
