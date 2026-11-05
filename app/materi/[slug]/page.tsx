import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, User } from "lucide-react";
import { activeGuru, getMateri, getSettings, listMateri } from "@/lib/content";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import MateriContent from "@/components/materi-content";
import FloatingBackButton from "@/components/floating-back-button";
import { FadeIn } from "@/components/motion";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return listMateri(activeGuru()).map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const materi = getMateri(activeGuru(), slug);
  return {
    title: materi ? `${materi.meta.judul}` : "Materi tak ditemukan",
    description: materi?.meta.ringkasan ?? "",
  };
}

export default async function HalamanMateri({ params }: Props) {
  const { slug } = await params;
  const guru = activeGuru();
  const materi = getMateri(guru, slug);
  if (!materi) notFound();

  const { meta, html } = materi;
  const s = getSettings(guru);

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pt-6 pb-16 sm:px-6 sm:pt-8">
        <FloatingBackButton
          href={meta.pelajaranSlug ? `/pelajaran/${meta.pelajaranSlug}` : "/"}
          label={meta.pelajaranJudul ? `Kembali ke ${meta.pelajaranJudul}` : "Kembali"}
        />

        <FadeIn>
          <header className="mt-6 rounded-xl border-3 border-border bg-card p-6 sm:p-8 neu-shadow">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-block rounded border-2 border-border bg-primary px-2.5 py-0.5 text-xs font-black uppercase text-primary-foreground">
                <User className="inline size-3.5 mr-1 stroke-[2.5]" />
                {s.namaGuru}
              </span>
              {meta.tanggal ? (
                <span className="inline-flex items-center gap-1 rounded border-2 border-border bg-muted px-2.5 py-0.5 text-xs font-bold text-foreground tabular-nums">
                  <Calendar className="size-3.5 stroke-[2]" />
                  {meta.tanggal}
                </span>
              ) : null}
            </div>

            <h1 className="mt-4 text-[clamp(1.85rem,5.5vw,2.75rem)] font-black leading-[1.1] tracking-tight text-foreground">
              {meta.judul}
            </h1>
          </header>
        </FadeIn>

        <FadeIn>
          <article className="prose prose-neutral mt-8 max-w-none dark:prose-invert">
            <MateriContent html={html} judul={meta.judul} />
          </article>
        </FadeIn>
      </main>
      <SiteFooter />
    </div>
  );
}

