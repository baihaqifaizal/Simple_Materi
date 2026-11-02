import { activeGuru, getSettings, listMateri } from "@/lib/content";
import SiteHeader from "@/components/site-header";
import MateriCard from "@/components/materi-card";
import SiteFooter from "@/components/site-footer";
import { FadeIn, Stagger } from "@/components/motion";

export default function Home() {
  const guru = activeGuru();
  const s = getSettings(guru);
  const daftar = listMateri(guru);

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-5 pt-10 pb-14 sm:px-6">
        <FadeIn>
          <div className="pb-8">
            <h1 className="text-[1.9rem] font-extrabold leading-[1.15] tracking-tighter sm:text-[2.25rem]">
              {s.judulSitus}
            </h1>
            {s.deskripsi ? (
              <p className="mt-3 max-w-lg text-[0.95rem] leading-relaxed text-muted-foreground">
                {s.deskripsi}
              </p>
            ) : null}
            <p className="mt-5 text-xs font-medium tabular-nums text-muted-foreground">
              {daftar.length ? `${daftar.length} materi` : ""}
            </p>
          </div>
          <hr className="border-border/70" />
        </FadeIn>

        {daftar.length === 0 ? (
          <div className="mt-10 rounded-xl border border-dashed border-border p-8 text-center">
            <p className="font-semibold">Belum ada materi</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Tulis file .md di folder <code>guru/{guru}/md/</code>, lalu jalankan build.
            </p>
          </div>
        ) : (
          <div className="mt-6">
            <Stagger>{daftar.map((m) => <MateriCard key={m.slug} materi={m} />)}</Stagger>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
