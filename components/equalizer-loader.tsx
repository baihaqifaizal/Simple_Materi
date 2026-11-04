const BAR = [
  { tinggi: "h-8", delay: "0s" },
  { tinggi: "h-14", delay: "0.12s" },
  { tinggi: "h-20", delay: "0.24s" },
  { tinggi: "h-12", delay: "0.06s" },
  { tinggi: "h-16", delay: "0.18s" },
];

export default function EqualizerLoader({ label }: { label: string }) {
  return (
    <div role="status" aria-live="polite" className="mt-2">
      <span className="sr-only">{label}</span>

      <div
        aria-hidden="true"
        className="flex items-end justify-center gap-1.5 pt-4"
      >
        {BAR.map((bar, i) => (
          <span
            key={i}
            className={`materi-bar w-3 rounded-sm border-2 border-border bg-primary ${bar.tinggi}`}
            style={{ animationDelay: bar.delay }}
          />
        ))}
      </div>
      <p
        aria-hidden="true"
        className="mt-3 text-center text-xs font-black uppercase tracking-[0.2em] text-muted-foreground"
      >
        {label}
      </p>
    </div>
  );
}
