import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NoticeFlow — CA Notice Workflow",
  description: "Notice workflow management for CA firms. Phase 0 bootstrap.",
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
