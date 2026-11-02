import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Simple Materi",
  description: "Materi guru dalam Markdown",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
