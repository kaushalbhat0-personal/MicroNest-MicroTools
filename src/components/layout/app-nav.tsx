import Link from "next/link";
import { NavShell } from "./nav-shell";

const links = [
  { href: "/app", label: "Dashboard", exact: true },
  { href: "/app/notices", label: "Notices" },
  { href: "/app/matters", label: "Matters" },
  { href: "/app/clients", label: "Clients" },
  { href: "/app/members", label: "Members" },
];

export function AppNav() {
  return (
    <NavShell
      brand={
        <Link href="/app" className="text-sm font-semibold">
          MicroNest
        </Link>
      }
      links={links}
    />
  );
}
