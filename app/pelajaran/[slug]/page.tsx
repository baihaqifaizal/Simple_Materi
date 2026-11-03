import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookOpen, GraduationCap } from "lucide-react";
import { activeGuru, getPelajaran, listPelajaran } from "@/lib/content";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import MateriCard from "@/components/materi-card";
import { FadeIn, Stagger } from "@/components/motion";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return listPelajaran(activeGuru()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const pelajaran = getPelajaran(activeGuru(), slug);
  return {
    title: pelajaran ? `${pelajaran.judul} — Materi Pelajaran` : "Pelajaran tak ditemukan",
    description: `Daftar materi untuk ${pelajaran?.judul ?? ""}`,
  };
}

export default async function HalamanPelajaran({ params }: Props) {
  const { slug } = await params;
  const guru = activeGuru();
  const pelajaran = getPelajaran(guru, slug);
  if (!pelajaran) notFound();

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 pt-6 pb-16 sm:px-6 sm:pt-8">
        <Link
          href="/"
          className="neu-btn inline-flex min-h-11 items-center gap-2 rounded-md bg-card px-4 py-2 text-xs font-black uppercase text-foreground no-underline"
        >
          <ArrowLeft className="size-4 stroke-[2.5]" />
          Kembali ke halaman utama
        </Link>

        <FadeIn>
          <header className="mt-6 rounded-2xl border-3 border-border bg-card p-6 sm:p-8 neu-shadow-lg">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded border-2 border-border bg-primary px-2.5 py-0.5 text-xs font-black uppercase text-primary-foreground">
                <GraduationCap className="size-3.5 stroke-[2.5]" />
                Pelajaran
              </span>
              <span className="text-xs font-bold text-muted-foreground">
                {pelajaran.daftarMateri.length} Materi Pembelajaran
              </span>
            </div>

            <h1 className="mt-4 text-[clamp(1.75rem,5vw,2.75rem)] font-black tracking-tight text-foreground leading-[1.1]">
              {pelajaran.judul}
            </h1>
            <p className="mt-2 text-sm sm:text-base font-semibold text-muted-foreground">
              Pilih salah satu materi di bawah ini untuk mulai membaca modul dan mengerjakan latihan.
            </p>
          </header>
        </FadeIn>

        <section className="mt-8 sm:mt-10">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg sm:text-xl font-black tracking-tight text-foreground">
              <BookOpen className="size-5 stroke-[2.5] text-primary" />
              Daftar Materi
            </h2>
            <span className="text-xs font-bold text-muted-foreground">Urut Pembelajaran</span>
          </div>

          {pelajaran.daftarMateri.length === 0 ? (
            <div className="rounded-xl border-3 border-dashed border-border p-8 text-center sm:p-12 bg-card">
              <p className="font-black text-foreground">Belum ada materi untuk pelajaran ini.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <Stagger>
                {pelajaran.daftarMateri.map((m, idx) => (
                  <MateriCard key={m.slug} materi={m} index={idx} />
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

