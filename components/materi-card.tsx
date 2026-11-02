import Link from "next/link";
import type { MateriMeta } from "@/lib/content";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function MateriCard({ materi }: { materi: MateriMeta }) {
  return (
    <Link href={`/materi/${materi.slug}`} className="block no-underline transition-transform duration-200 hover:-translate-y-0.5">
      <Card className="gap-2 border-border/70 shadow-none transition-colors hover:border-primary/40 hover:bg-accent/40">
        <CardHeader>
          <CardTitle className="text-base leading-snug">{materi.judul}</CardTitle>
          <CardDescription className="line-clamp-3 text-[0.85rem] leading-relaxed">
            {materi.ringkasan}
          </CardDescription>
          {materi.tanggal ? (
            <span className="text-xs text-muted-foreground">{materi.tanggal}</span>
          ) : null}
        </CardHeader>
      </Card>
    </Link>
  );
}
