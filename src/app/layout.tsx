import type { Metadata } from "next";
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
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
