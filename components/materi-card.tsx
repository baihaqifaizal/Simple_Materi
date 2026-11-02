import Link from "next/link";
import type { MateriMeta } from "@/lib/content";

/** Daftar materi: kartu ringan, hairline, tanpa hiasan berlebihan. */
export default function MateriCard({ materi }: { materi: MateriMeta }) {
  return (
    <Link
      href={`/materi/${materi.slug}`}
      className="group -mx-2 block rounded-xl px-2 py-4 no-underline transition-colors hover:bg-accent/60 sm:-mx-4 sm:px-4"
    >
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-[1.05rem] font-bold tracking-tight group-hover:text-primary transition-colors">
          {materi.judul}
        </h2>
        <span className="text-[0.7rem] font-medium text-primary/70">
          Baca
        </span>
      </div>
      {materi.ringkasan ? (
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {materi.ringkasan}
        </p>
      ) : null}
    </Link>
  );
}
