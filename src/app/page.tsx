import Link from "next/link";
import { professions, tools } from "@/content/microtools";
import { ProfessionCard } from "@/components/marketing/profession-card";
import { Reveal } from "@/components/marketing/reveal";
import { SiteNav } from "@/components/layout/site-nav";
import { Badge } from "@/components/ui/badge";

export default function HomePage() {
  return (
    <>
      <SiteNav />
      <main className="mx-auto max-w-5xl space-y-8 p-6 md:p-8">
        <section className="relative overflow-hidden rounded-lg bg-muted/10 py-16 md:py-20">
          <div className="bg-grid pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />
          <div className="relative space-y-6 px-6 text-center">
            <p className="mn-reveal text-xs font-medium tracking-[0.2em] uppercase text-muted-foreground" style={{ animationDelay: "0ms" }}>
              Focused software for professional workflows
            </p>
            <h1 className="mn-reveal mx-auto max-w-2xl text-4xl font-bold tracking-tight text-balance md:text-5xl" style={{ animationDelay: "60ms" }}>
              Small tools for the work that matters.
            </h1>
            <p className="mn-reveal mx-auto max-w-2xl text-balance text-base leading-6 text-muted-foreground md:text-lg" style={{ animationDelay: "120ms" }}>
              Small, focused software tools for professionals. Built around specific workflows, not all-in-one platforms.
            </p>
            <div className="mn-reveal flex flex-col items-center justify-center gap-3 sm:flex-row" style={{ animationDelay: "180ms" }}>
              <Link href="/profession/chartered-accountants" className="inline-flex h-9 items-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-all duration-200 hover:bg-primary/90 active:scale-[0.98]">Explore MicroTools</Link>
              <Link href="/app" className="inline-flex h-9 items-center rounded-md border bg-background px-6 text-sm font-medium transition-colors duration-200 hover:bg-accent active:scale-[0.98]">Launch App</Link>
            </div>
            <div className="mn-reveal flex flex-col items-center gap-3 pt-6 sm:flex-row sm:justify-center sm:gap-4" style={{ animationDelay: "240ms" }} aria-label="How MicroNest works">
              <div className="flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm"><span className="h-2 w-2 rounded-full bg-primary" aria-hidden="true" /><span>Profession</span></div>
              <span className="hidden text-muted-foreground sm:inline" aria-hidden="true">→</span>
              <span className="text-muted-foreground sm:hidden" aria-hidden="true">↓</span>
              <div className="flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm"><span className="h-2 w-2 rounded-full bg-primary" aria-hidden="true" /><span>Workflow</span></div>
              <span className="hidden text-muted-foreground sm:inline" aria-hidden="true">→</span>
              <span className="text-muted-foreground sm:hidden" aria-hidden="true">↓</span>
              <div className="flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm"><span className="h-2 w-2 rounded-full bg-primary" aria-hidden="true" /><span>MicroTool</span></div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Browse by Profession</h2>
          <div className={professions.length === 1 ? "grid gap-4 max-w-3xl mx-auto" : "grid gap-4 md:grid-cols-2"}>
            {professions.map((p, i) => (
              <ProfessionCard key={p.slug} profession={p} delayMs={i * 60} />
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Featured MicroTools</h2>
          <div className={tools.length === 1 ? "grid gap-4 max-w-4xl mx-auto" : "grid gap-4 md:grid-cols-2"}>
            {tools.map((t, i) => (
              <Link key={t.slug} href={t.href} className="mn-card overflow-hidden rounded-md border hover:bg-accent">
                <Reveal delayMs={i * 60}>
                  <div className="p-6">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-lg font-semibold">{t.name}</h3>
                      <Badge variant={t.status === "available" ? "default" : "outline"}>{t.status === "available" ? "Available" : "Coming soon"}</Badge>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{t.description}</p>
                  </div>
                  {t.slug === "noticeflow" ? (
                    <div className="flex flex-wrap items-center gap-1.5 border-t bg-muted/20 px-6 py-3 text-xs">
                      <span className="rounded-full border bg-background px-2 py-0.5">Receipt</span>
                      <span className="text-muted-foreground" aria-hidden="true">→</span>
                      <span className="rounded-full border bg-background px-2 py-0.5">Review</span>
                      <span className="text-muted-foreground" aria-hidden="true">→</span>
                      <span className="rounded-full border bg-background px-2 py-0.5">Draft</span>
                      <span className="text-muted-foreground" aria-hidden="true">→</span>
                      <span className="rounded-full border bg-background px-2 py-0.5">Submit</span>
                      <span className="text-muted-foreground" aria-hidden="true">→</span>
                      <span className="rounded-full border bg-background px-2 py-0.5">Follow-up</span>
                      <span className="text-muted-foreground" aria-hidden="true">→</span>
                      <span className="rounded-full border bg-background px-2 py-0.5">Close</span>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center gap-1.5 border-t bg-muted/20 px-6 py-3 text-xs">
                      <span className="rounded-full border bg-background px-2 py-0.5">Create</span>
                      <span className="text-muted-foreground" aria-hidden="true">→</span>
                      <span className="rounded-full border bg-background px-2 py-0.5">Checklist</span>
                      <span className="text-muted-foreground" aria-hidden="true">→</span>
                      <span className="rounded-full border bg-background px-2 py-0.5">Upload</span>
                      <span className="text-muted-foreground" aria-hidden="true">→</span>
                      <span className="rounded-full border bg-background px-2 py-0.5">Verify</span>
                      <span className="text-muted-foreground" aria-hidden="true">→</span>
                      <span className="rounded-full border bg-background px-2 py-0.5">Ready</span>
                      <span className="text-muted-foreground" aria-hidden="true">→</span>
                      <span className="rounded-full border bg-background px-2 py-0.5">Archive</span>
                    </div>
                  )}
                </Reveal>
              </Link>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Why MicroTools</h2>
          <div className="border-t pt-6">
            <Reveal>
              <div className="grid gap-6 md:grid-cols-3">
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
            </Reveal>
          </div>
        </section>

        <footer className="flex flex-col items-center gap-2 border-t pt-6 text-sm text-muted-foreground sm:flex-row sm:justify-between">
          <div className="text-center sm:text-left">
            <p>MicroNest MicroTools — Chartered Accountants • NoticeFlow • Lawyers • MatterVault</p>
            <p className="text-xs">© 2026 Kaushal Bhat. All rights reserved.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/profession/chartered-accountants" className="underline">
              Chartered Accountants
            </Link>
            <Link href="/tools/noticeflow" className="underline">
              NoticeFlow
            </Link>
            <Link href="/profession/lawyers" className="underline">
              Lawyers
            </Link>
            <Link href="/tools/mattervault" className="underline">
              MatterVault
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
