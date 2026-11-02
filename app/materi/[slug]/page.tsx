import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, User } from "lucide-react";
import { activeGuru, getMateri, getSettings, listMateri, type Block } from "@/lib/content";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import YouTubeEmbed from "@/components/youtube-embed";
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

  const { meta, blocks } = materi;
  const s = getSettings(guru);

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pt-6 pb-16 sm:px-6 sm:pt-8">
        <Link
          href={meta.pelajaranSlug ? `/pelajaran/${meta.pelajaranSlug}` : "/"}
          className="neu-btn inline-flex min-h-11 items-center gap-2 rounded-md bg-card px-4 py-2 text-xs font-black uppercase text-foreground no-underline"
        >
          <ArrowLeft className="size-4 stroke-[2.5]" />
          {meta.pelajaranJudul ? `Kembali ke ${meta.pelajaranJudul}` : "Kembali"}
        </Link>

        <FadeIn>
          <header className="mt-6 rounded-xl border-3 border-border bg-card p-6 sm:p-8 neu-shadow">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-block rounded border-2 border-border bg-primary px-2.5 py-0.5 text-xs font-black uppercase text-foreground">
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

            {meta.ringkasan ? (
              <p className="mt-3 text-base sm:text-lg font-medium leading-relaxed text-muted-foreground">
                {meta.ringkasan}
              </p>
            ) : null}
          </header>
        </FadeIn>

        <FadeIn>
          <article className="prose prose-neutral mt-8 max-w-none dark:prose-invert">
            {blocks.map((b, i) => (
              <BlockSatu key={i} block={b} judul={meta.judul} />
            ))}
          </article>
        </FadeIn>
      </main>
      <SiteFooter />
    </div>
  );
}

function BlockSatu({ block, judul }: { block: Block; judul?: string }) {
  if (block.type === "youtube") {
    return <YouTubeEmbed id={block.id} judul={judul} />;
  }
  return <div dangerouslySetInnerHTML={{ __html: block.html }} />;
}
