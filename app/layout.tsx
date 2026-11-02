import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { activeGuru, getSettings } from "@/lib/content";
import { temaValid } from "@/lib/theme";
import "./globals.css";

const fontSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

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
  const scriptNoFlash = `(function(){try{var t=localStorage.getItem('tema');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark');}catch(e){}})();`;
  return (
    <html
      lang="id"
      data-tema={temaValid(s.temaWarna)}
      className={`${fontSans.variable} font-sans`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: scriptNoFlash }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
