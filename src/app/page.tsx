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
        <section className="relative overflow-hidden rounded-lg bg-muted/10 py-16 md:py-24">
          <div className="bg-grid pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />
          <div className="relative space-y-6 px-6 text-center">
            <p className="text-xs font-medium tracking-[0.2em] uppercase text-muted-foreground">Focused software for professional workflows</p>
            <h1 className="mx-auto max-w-2xl text-4xl font-bold tracking-tight text-balance md:text-5xl">Small tools for the work that matters.</h1>
            <p className="mx-auto max-w-2xl text-balance text-base leading-6 text-muted-foreground md:text-lg">
              Small, focused software tools for professionals. Built around specific workflows, not all-in-one platforms.
            </p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/profession/chartered-accountants" className="inline-flex h-9 items-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground active:scale-[0.98]">Explore MicroTools</Link>
              <Link href="/app" className="inline-flex h-9 items-center rounded-md border bg-background px-6 text-sm font-medium active:scale-[0.98]">Launch App</Link>
            </div>
          </div>
        </section>

        <section className="flex flex-col items-center gap-2 py-4 sm:flex-row sm:justify-center" aria-label="How MicroNest works">
          <div className="flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs"><span className="h-2 w-2 rounded-full bg-primary" aria-hidden="true" /><span>Chartered Accountants</span></div>
          <span className="hidden text-muted-foreground sm:inline" aria-hidden="true">→</span>
          <span className="text-muted-foreground sm:hidden" aria-hidden="true">↓</span>
          <div className="flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs"><span className="h-2 w-2 rounded-full bg-primary" aria-hidden="true" /><span>GST/Income-tax notice</span></div>
          <span className="hidden text-muted-foreground sm:inline" aria-hidden="true">→</span>
          <span className="text-muted-foreground sm:hidden" aria-hidden="true">↓</span>
          <div className="flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs"><span className="h-2 w-2 rounded-full bg-primary" aria-hidden="true" /><span>NoticeFlow</span></div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Browse by Profession</h2>
          <div className={professions.length === 1 ? "grid gap-4 max-w-md mx-auto" : "grid gap-4 md:grid-cols-2"}>
            {professions.map((p) => (
              <ProfessionCard key={p.slug} profession={p} />
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Featured MicroTool</h2>
          <div className={tools.length === 1 ? "grid gap-4 max-w-md mx-auto" : "grid gap-4 md:grid-cols-2"}>
            {tools.map((t) => (
              <div key={t.slug} className="space-y-0">
                <ToolCard tool={t} />
                <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t pt-3 text-xs">
                  <span className="rounded-full border bg-muted/30 px-2 py-0.5">Receipt</span>
                  <span className="text-muted-foreground" aria-hidden="true">→</span>
                  <span className="rounded-full border bg-muted/30 px-2 py-0.5">Review</span>
                  <span className="text-muted-foreground" aria-hidden="true">→</span>
                  <span className="rounded-full border bg-muted/30 px-2 py-0.5">Draft</span>
                  <span className="text-muted-foreground" aria-hidden="true">→</span>
                  <span className="rounded-full border bg-muted/30 px-2 py-0.5">Submit</span>
                  <span className="text-muted-foreground" aria-hidden="true">→</span>
                  <span className="rounded-full border bg-muted/30 px-2 py-0.5">Follow-up</span>
                  <span className="text-muted-foreground" aria-hidden="true">→</span>
                  <span className="rounded-full border bg-muted/30 px-2 py-0.5">Close</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Why MicroTools</h2>
          <div className="grid gap-6 border-t pt-6 md:grid-cols-3">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Focused</h3>
              <p className="text-sm leading-6 text-muted-foreground">One workflow, one tool — not platform bloat. Each MicroTool does a single statutory job from receipt to closure.</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Professional</h3>
              <p className="text-sm leading-6 text-muted-foreground">Built around professional statutory workflows, not generic all-in-one software. Tenant-isolated, audit-trailed, deadline-aware.</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Workflow-first</h3>
              <p className="text-sm leading-6 text-muted-foreground">From receipt to review to closure, with the documents, notes, and activity needed to keep work organized — without spreadsheets.</p>
            </div>
          </div>
        </section>

        <footer className="flex flex-col items-center gap-2 border-t pt-6 text-sm text-muted-foreground sm:flex-row sm:justify-between">
          <div className="text-center sm:text-left">
            <p>MicroNest MicroTools — Chartered Accountants • NoticeFlow and future microtools</p>
            <p className="text-xs">© 2026 Kaushal Bhat. All rights reserved.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
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
