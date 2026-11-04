import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import EqualizerLoader from "@/components/equalizer-loader";

export default function MateriLoading() {
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <SiteHeader />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pt-6 pb-16 sm:px-6 sm:pt-8">
        <EqualizerLoader label="Memuat materi…" />

        <div
          aria-hidden="true"
          className="mt-8 rounded-xl border-3 border-border bg-card p-6 neu-shadow sm:p-8"
        >
          <div className="h-5 w-28 animate-pulse rounded bg-muted motion-reduce:animate-none" />
          <div className="mt-4 h-9 w-3/4 animate-pulse rounded bg-muted motion-reduce:animate-none" />
          <div className="mt-3 h-4 w-full animate-pulse rounded bg-muted motion-reduce:animate-none" />
          <div className="mt-2 h-4 w-5/6 animate-pulse rounded bg-muted motion-reduce:animate-none" />
        </div>

        <div aria-hidden="true" className="mt-8 space-y-3">
          {["w-full", "w-11/12", "w-full", "w-4/5"].map((lebar, i) => (
            <div
              key={i}
              className={`h-4 animate-pulse rounded bg-muted motion-reduce:animate-none ${lebar}`}
            />
          ))}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
