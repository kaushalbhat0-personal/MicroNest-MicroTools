import Link from "next/link";
import { NavShell } from "./nav-shell";

const links = [
  { href: "/", label: "Home", exact: true },
  { href: "/profession/chartered-accountants", label: "Chartered Accountants" },
  { href: "/tools/noticeflow", label: "NoticeFlow" },
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
