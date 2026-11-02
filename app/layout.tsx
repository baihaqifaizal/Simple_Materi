import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Geist } from "next/font/google";
import { activeGuru, getSettings } from "@/lib/content";
import { temaValid } from "@/lib/theme";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export async function generateMetadata(): Promise<Metadata> {
  const s = getSettings(activeGuru());
  return {
    title: s.judulSitus,
    description: s.deskripsi,
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const s = getSettings(activeGuru());
  return (
    <html
      lang="id"
      data-tema={temaValid(s.temaWarna)}
      className={cn("font-sans", geist.variable)}
    >
      <body>{children}</body>
    </html>
  );
}
