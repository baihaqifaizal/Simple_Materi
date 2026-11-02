import Link from "next/link";
import { activeGuru, getSettings, listMateri } from "@/lib/content";
import SiteHeader from "@/components/site-header";
import MateriCard from "@/components/materi-card";
import { FadeIn, Stagger } from "@/components/motion";

export default function Home() {
  const guru = activeGuru();
  const s = getSettings(guru);
  const daftar = listMateri(guru);

  return (
    <div className="min-h-dvh">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-5 pt-8 pb-16">
        <FadeIn>
          <h1 className="text-2xl font-extrabold tracking-tight">{s.judulSitus}</h1>
          <p className="mt-1.5 text-muted-foreground text-[0.9rem]">
            Materi {s.mapel ? `mapel ${s.mapel}` : ""} — {s.deskripsi}
          </p>
        </FadeIn>

        {daftar.length === 0 ? (
          <div className="mt-10 rounded-xl border border-dashed border-border p-8 text-center">
            <p className="font-semibold">Belum ada materi</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Tulis file .md di folder <code>guru/{guru}/md/</code>, lalu jalankan build.
            </p>
          </div>
        ) : (
          <Stagger>
            {daftar.map((m) => (
              <MateriCard key={m.slug} materi={m} />
            ))}
          </Stagger>
        )}
      </main>
    </div>
  );
}
