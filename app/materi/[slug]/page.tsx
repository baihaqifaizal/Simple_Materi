import { notFound } from "next/navigation";
import { activeGuru, getMateri, getSettings, listMateri, type Block } from "@/lib/content";
import SiteHeader from "@/components/site-header";

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
    <div className="min-h-dvh">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-5 pt-10 pb-16">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          {s.namaGuru}
        </p>
        <h1 className="mt-2 text-[1.75rem] font-extrabold leading-tight tracking-tight">
          {meta.judul}
        </h1>
        {meta.tanggal ? (
          <p className="mt-2 text-sm text-muted-foreground">{meta.tanggal}</p>
        ) : null}

        <div className="prose prose-neutral mt-8 max-w-none prose-headings:tracking-tight prose-headings:font-bold prose-img:rounded-xl">
          {blocks.map((b, i) => (
            <BlockSatu key={i} block={b} />
          ))}
        </div>
      </main>
    </div>
  );
}

function BlockSatu({ block }: { block: Block }) {
  if (block.type === "youtube") {
    // placeholder — komponen asli di Task 8
    return (
      <div
        data-youtube-id={block.id}
        className="aspect-video rounded-xl border border-dashed border-border"
      />
    );
  }
  return <div dangerouslySetInnerHTML={{ __html: block.html }} />;
}
