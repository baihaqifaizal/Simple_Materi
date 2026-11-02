import { activeGuru, getSettings } from "@/lib/content";

export default function SiteFooter() {
  const s = getSettings(activeGuru());
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto flex max-w-2xl flex-wrap items-center justify-between gap-2 px-5 py-6 sm:px-6">
        <p className="text-xs text-muted-foreground">
          {s.namaGuru}
          {s.mapel ? ` · ${s.mapel}` : ""}
        </p>
        <p className="text-xs text-muted-foreground">manurhidma.my.id</p>
      </div>
    </footer>
  );
}
