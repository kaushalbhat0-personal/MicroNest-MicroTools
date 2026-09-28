"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/app", label: "Dashboard", exact: true },
  { href: "/app/notices", label: "Notices" },
  { href: "/app/matters", label: "Matters" },
  { href: "/app/clients", label: "Clients" },
  { href: "/app/members", label: "Members" },
];

export function AppNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-10 border-b bg-background">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 md:px-6">
        <Link href="/app" className="text-sm font-semibold">
          NoticeFlow
        </Link>
        <button
          type="button"
          aria-label="Toggle navigation"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border md:hidden"
        >
          <span aria-hidden>{open ? "✕" : "☰"}</span>
        </button>
        <nav aria-label="Primary" className={`${open ? "flex" : "hidden"} w-full flex-col gap-1 md:flex md:w-auto md:flex-row md:items-center md:gap-2`}>
          {links.map((l) => {
            const active = l.exact ? pathname === l.href : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                onClick={() => setOpen(false)}
                className={`rounded-md px-3 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 ${active ? "bg-foreground text-background" : "hover:bg-accent"}`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
