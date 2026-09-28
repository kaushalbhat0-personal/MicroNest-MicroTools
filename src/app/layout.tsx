import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://micronestmicrotools.vercel.app"),
  title: {
    default: "MicroNest MicroTools — Lightweight tools for professionals",
    template: "%s — MicroNest MicroTools",
  },
  description: "MicroNest MicroTools — small, focused software tools for professionals. Chartered Accountants: NoticeFlow and future microtools.",
  openGraph: {
    title: "MicroNest MicroTools",
    description: "Small, focused software tools for professionals.",
    url: "https://micronestmicrotools.vercel.app",
    siteName: "MicroNest MicroTools",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="min-h-screen bg-background text-foreground antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
