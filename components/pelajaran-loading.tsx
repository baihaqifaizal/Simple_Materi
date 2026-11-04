import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import EqualizerLoader from "@/components/equalizer-loader";

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded bg-muted motion-reduce:animate-none ${className}`}
    />
  );
}

export default function PelajaranLoading() {
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <SiteHeader />

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 pt-6 pb-16 sm:px-6 sm:pt-8">
        <EqualizerLoader label="Memuat pelajaran…" />

        <div
          aria-hidden="true"
          className="mt-6 rounded-2xl border-3 border-border bg-card p-6 neu-shadow-lg sm:p-8"
        >
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="mt-4 h-10 w-3/4" />
          <Skeleton className="mt-3 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-5/6" />
        </div>

        <div aria-hidden="true" className="mt-8 sm:mt-10">
          <div className="mb-5 flex items-center justify-between">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-24" />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-xl border-3 border-border bg-card p-5 neu-shadow sm:p-6"
              >
                <div className="flex items-center justify-between gap-3">
                  <Skeleton className="h-6 w-12" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="mt-4 h-5 w-5/6" />
                <Skeleton className="mt-2 h-4 w-full" />
                <Skeleton className="mt-5 h-4 w-1/3" />
              </div>
            ))}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
