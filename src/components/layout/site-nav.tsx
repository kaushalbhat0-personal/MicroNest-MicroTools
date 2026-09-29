import Link from "next/link";
import { professions } from "@/content/microtools";
import { NavShell } from "./nav-shell";

const links = [
  { href: "/", label: "Home", exact: true },
  ...professions.map((p) => ({
    href: `/profession/${p.slug}`,
    label: p.name,
    children: p.tools.map((t) => ({ href: t.href, label: t.name })),
  })),
];

export function SiteNav() {
  return (
    <NavShell
      brand={
        <Link href="/" className="text-sm font-semibold">
          MicroNest MicroTools
        </Link>
      }
      links={links}
      cta={
        <Link href="/app" className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          Launch App
        </Link>
      }
    />
  );
}
