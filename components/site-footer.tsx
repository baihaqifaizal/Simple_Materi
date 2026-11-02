export default function SiteFooter() {
  return (
    <footer className="mt-auto border-t-2 border-border bg-card">
      <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-3 px-4 py-8 text-center sm:flex-row sm:px-6 sm:text-left">
        <div className="space-y-0.5">
          <p className="text-sm font-extrabold text-foreground">
            Materi
          </p>
          <p className="text-xs font-semibold text-muted-foreground">
            MA Nurul Hidayah Majalangu
          </p>
        </div>
        <p className="text-xs font-bold text-muted-foreground">
          <span className="text-foreground underline underline-offset-2">manurhidma.my.id</span>
        </p>
      </div>
    </footer>
  );
}
