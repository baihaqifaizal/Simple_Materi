import { activeGuru, getSettings, listPelajaran } from "@/lib/content";
import SiteHeader from "@/components/site-header";
import PelajaranCard from "@/components/pelajaran-card";
import SiteFooter from "@/components/site-footer";
import { FadeIn, Stagger } from "@/components/motion";
import { BookOpen, Megaphone, Sparkles } from "lucide-react";

export default function Home() {
  const guru = activeGuru();
  const s = getSettings(guru);
  const daftarPelajaran = listPelajaran(guru);

  const namaGuruTampil = s.namaGuru.startsWith("Pak ") || s.namaGuru.startsWith("Bu ")
    ? s.namaGuru
    : `Pak ${s.namaGuru}`;

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <SiteHeader />

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 pt-6 pb-16 sm:px-6 sm:pt-10">
        {/* Banner Profil Guru */}
        <FadeIn>
          <div className="rounded-2xl border-3 border-border bg-card p-6 sm:p-8 neu-shadow-lg">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              {/* Foto Profil Circle */}
              {s.fotoProfil ? (
                <div className="relative shrink-0">
                  <div className="size-24 sm:size-28 rounded-full border-3 border-border bg-muted overflow-hidden neu-shadow">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/gambar/${s.fotoProfil}`}
                      alt={namaGuruTampil}
                      className="size-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 rounded-full border-2 border-border bg-secondary p-1.5 neu-shadow">
                    <Sparkles className="size-4 stroke-[2.5] text-secondary-foreground" />
                  </div>
                </div>
              ) : null}

              <div className="flex-1 space-y-2">
                <h1 className="text-[clamp(1.75rem,5vw,2.75rem)] font-black tracking-tight text-foreground leading-[1.1]">
                  {namaGuruTampil}
                </h1>

                <p className="max-w-xl text-sm sm:text-base font-medium leading-relaxed text-muted-foreground">
                  {s.deskripsi || `Portal materi dan tugas siswa untuk pelajaran ${namaGuruTampil}`}
                </p>
              </div>
            </div>

            {/* Kotak Pemberitahuan jika ada */}
            {s.pemberitahuan ? (
              <div className="mt-6 rounded-xl border-2 border-border bg-secondary/15 p-4 sm:p-5 flex items-start gap-3.5">
                <div className="rounded-lg border-2 border-border bg-secondary p-2 shrink-0 text-secondary-foreground">
                  <Megaphone className="size-5 stroke-[2.5]" />
                </div>
                <div>
                  <h2 className="text-xs font-black uppercase tracking-wider text-foreground">
                    Pemberitahuan Guru
                  </h2>
                  <p className="mt-1 text-sm font-semibold leading-relaxed text-foreground/90">
                    {s.pemberitahuan}
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </FadeIn>

        {/* Section Pelajaran */}
        <section className="mt-10 sm:mt-12">
          <div className="mb-6 flex items-center justify-between gap-3">
            <h1 className="flex items-center gap-2.5 text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              <BookOpen className="size-7 stroke-[2.5] text-primary" />
              Pelajaran
            </h1>
            <span className="rounded border-2 border-border bg-card px-3 py-1 font-mono text-xs font-black text-foreground neu-shadow">
              {daftarPelajaran.length} Pelajaran
            </span>
          </div>

          {daftarPelajaran.length === 0 ? (
            <div className="rounded-xl border-3 border-dashed border-border p-8 text-center sm:p-12 bg-card">
              <p className="font-black text-foreground text-lg">Belum ada pelajaran</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Tulis daftar pelajaran di <code className="border border-border bg-muted px-1.5 py-0.5 rounded text-xs font-mono">guru/{guru}/settings.json</code>.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
              <Stagger>
                {daftarPelajaran.map((pel, idx) => (
                  <PelajaranCard key={pel.slug} pelajaran={pel} index={idx} />
                ))}
              </Stagger>
            </div>
          )}
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
