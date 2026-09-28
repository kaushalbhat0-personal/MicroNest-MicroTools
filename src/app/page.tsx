import Link from "next/link";
import { professions, tools } from "@/content/microtools";
import { ProfessionCard } from "@/components/marketing/profession-card";
import { ToolCard } from "@/components/marketing/tool-card";
import { SiteNav } from "@/components/layout/site-nav";

export default function HomePage() {
  return (
    <>
      <SiteNav />
      <main className="mx-auto max-w-5xl space-y-12 p-6 md:p-8">
        <section className="space-y-4 py-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight">MicroNest MicroTools</h1>
          <p className="mx-auto max-w-2xl text-balance text-muted-foreground">
            Small, focused software tools for professionals. Built around specific workflows, not all-in-one platforms.
          </p>
          <div className="flex justify-center gap-3">
            <Link href="/profession/chartered-accountants" className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">
              Explore MicroTools
            </Link>
            <Link href="/tools/noticeflow" className="inline-flex h-9 items-center rounded-md border px-4 text-sm font-medium">
              View NoticeFlow
            </Link>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Browse by Profession</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {professions.map((p) => (
              <ProfessionCard key={p.slug} profession={p} />
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">MicroTools</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {tools.map((t) => (
              <ToolCard key={t.slug} tool={t} />
            ))}
          </div>
        </section>

        <section className="rounded-md border p-6">
          <h2 className="text-lg font-semibold">Why MicroTools</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            <li>Focused — one workflow, one tool</li>
            <li>Lightweight — no practice-management bloat</li>
            <li>Built around specific professional workflows</li>
          </ul>
        </section>

        <footer className="border-t pt-6 text-center text-sm text-muted-foreground">
          <p>MicroNest MicroTools — Chartered Accountants • NoticeFlow and future microtools</p>
          <div className="mt-2 flex justify-center gap-4">
            <Link href="/profession/chartered-accountants" className="underline">
              Chartered Accountants
            </Link>
            <Link href="/tools/noticeflow" className="underline">
              NoticeFlow
            </Link>
            <Link href="/app" className="underline">
              Launch App
            </Link>
          </div>
        </footer>
      </main>
    </>
  );
}
