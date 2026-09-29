import Link from "next/link";
import { NavShell } from "./nav-shell";

type AppNavProps = {
  isNoticeflowSubscribed: boolean;
  isMattervaultSubscribed: boolean;
};

export function AppNav({ isNoticeflowSubscribed, isMattervaultSubscribed }: AppNavProps) {
  const microtoolChildren: { href: string; label: string }[] = [];
  if (isNoticeflowSubscribed) microtoolChildren.push({ href: "/app/notices", label: "NoticeFlow — Notices" });
  if (isMattervaultSubscribed) microtoolChildren.push({ href: "/app/matters", label: "MatterVault — Matters" });

  const links = [
    { href: "/app", label: "Dashboard", exact: true },
    {
      href: "/app/clients",
      label: "Firm",
      children: [
        { href: "/app/clients", label: "Clients" },
        { href: "/app/members", label: "Members" },
        { href: "/app/settings", label: "Settings" },
        { href: "/app/billing", label: "Billing" },
      ],
    },
    ...(microtoolChildren.length > 0
      ? [
          {
            href: microtoolChildren[0].href,
            label: "MicroTools",
            children: microtoolChildren,
          },
        ]
      : []),
  ];

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
