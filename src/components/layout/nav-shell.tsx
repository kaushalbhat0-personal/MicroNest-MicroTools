"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type NavLink = { href: string; label: string; exact?: boolean; children?: NavLink[] };

type NavShellProps = {
  brand: React.ReactNode;
  links: NavLink[];
  cta?: React.ReactNode;
};

export function NavShell({ brand, links, cta }: NavShellProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDesktopOpen(null);
        setMobileOpen({});
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    // close dropdowns on route change
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDesktopOpen(null);
  }, [pathname]);

  const isActive = (l: NavLink) => (l.exact ? pathname === l.href : pathname.startsWith(l.href));
  const isParentActive = (l: NavLink) => {
    if (!l.children) return isActive(l);
    return isActive(l) || l.children.some((c) => pathname.startsWith(c.href));
  };

  return (
    <header className="sticky top-0 z-20 border-b bg-background">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-6 lg:px-8">
        {brand}
        <button
          type="button"
          aria-label="Toggle navigation"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border transition-colors duration-200 hover:bg-accent md:hidden"
        >
          <span aria-hidden>{open ? "✕" : "☰"}</span>
        </button>
        <nav
          aria-label="Primary"
          className={`${open ? "flex" : "hidden"} w-full flex-col gap-1 md:flex md:w-auto md:flex-row md:items-center md:gap-2`}
        >
          {links.map((l) => {
            if (!l.children || l.children.length === 0) {
              const active = isActive(l);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setOpen(false)}
                  className={`rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 ${active ? "bg-primary text-primary-foreground" : "hover:bg-accent hover:text-accent-foreground"}`}
                >
                  {l.label}
                </Link>
              );
            }

            const active = isParentActive(l);
            const isOpen = desktopOpen === l.href || !!mobileOpen[l.href];
            const submenuId = `submenu-${l.href.replace(/\//g, "-")}`;

            return (
              <div
                key={l.href}
                className="relative"
                onMouseEnter={() => setDesktopOpen(l.href)}
                onMouseLeave={() => setDesktopOpen(null)}
                onFocusCapture={() => setDesktopOpen(l.href)}
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) setDesktopOpen(null);
                }}
              >
                <div className="flex items-center">
                  <Link
                    href={l.href}
                    aria-current={isActive(l) ? "page" : undefined}
                    onClick={() => {
                      setOpen(false);
                      setDesktopOpen(null);
                    }}
                    onFocus={() => setDesktopOpen(l.href)}
                    className={`rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 ${active ? "bg-primary text-primary-foreground" : "hover:bg-accent hover:text-accent-foreground"}`}
                  >
                    {l.label}
                  </Link>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={submenuId}
                    aria-label={`Toggle ${l.label} submenu`}
                    onClick={() => {
                      setDesktopOpen((prev) => (prev === l.href ? null : l.href));
                      setMobileOpen((prev) => ({ ...prev, [l.href]: !prev[l.href] }));
                    }}
                    className={`ml-0 inline-flex h-10 w-10 items-center justify-center rounded-md text-xs transition-colors duration-200 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 ${active ? "text-background" : ""}`}
                  >
                    <span aria-hidden className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>
                      ▾
                    </span>
                  </button>
                </div>

                {/* Dropdown — desktop absolute, mobile inline. Visible when isOpen */}
                {isOpen && (
                  <div
                    id={submenuId}
                    className="mt-1 w-full rounded-md border bg-background p-1 md:absolute md:left-0 md:top-full md:mt-2 md:w-56 md:shadow-sm"
                  >
                    {l.children.map((child) => {
                      const childActive = pathname.startsWith(child.href);
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          aria-current={childActive ? "page" : undefined}
                          onClick={() => {
                            setOpen(false);
                            setDesktopOpen(null);
                            setMobileOpen({});
                          }}
                          className={`block rounded-md px-3 py-2 text-sm transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 ${childActive ? "bg-primary text-primary-foreground" : "hover:bg-accent hover:text-accent-foreground"}`}
                        >
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                )}

                {/* Mobile inline list when collapsed nav is open — alternative rendering for mobileOpen only */}
                {/* The same dropdown above already serves mobile as w-full inside flex-col; kept single for simplicity */}
              </div>
            );
          })}
          {cta && <div className="md:ml-2">{cta}</div>}
        </nav>
      </div>
    </header>
  );
}
