import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
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
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-5 pt-8 pb-14 sm:px-6">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center gap-1.5 text-[0.8rem] font-medium text-muted-foreground no-underline transition-colors hover:text-primary"
        >
          <ChevronLeft className="size-4" />
          Semua materi
        </Link>

        <FadeIn>
          <div className="mt-4 pb-8">
            <p className="text-[0.75rem] font-semibold uppercase tracking-wider text-primary">
              {s.namaGuru}
            </p>
            <h1 className="mt-1.5 text-[1.9rem] font-extrabold leading-[1.15] tracking-tighter sm:text-[2.25rem]">
              {meta.judul}
            </h1>
            {meta.tanggal ? (
              <p className="mt-3 text-xs tabular-nums text-muted-foreground">
                {s.mapel ? `${s.mapel} · ` : ""}
                {meta.tanggal}
              </p>
            ) : null}
          </div>
          <hr className="border-border/70" />
        </FadeIn>

        <FadeIn>
          <div className="prose prose-neutral mt-8 max-w-none dark:prose-invert prose-headings:tracking-tight prose-headings:font-bold">
            {blocks.map((b, i) => (
              <BlockSatu key={i} block={b} judul={meta.judul} />
            ))}
          </div>
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
