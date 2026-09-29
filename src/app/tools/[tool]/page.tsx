import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getProfession, getTool, tools } from "@/content/microtools";
import { Badge } from "@/components/ui/badge";
import { SiteNav } from "@/components/layout/site-nav";

export function generateStaticParams() {
  return tools.map((t) => ({ tool: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ tool: string }> }): Promise<Metadata> {
  const { tool } = await params;
  const data = getTool(tool);
  if (!data) return {};
  return {
    title: `${data.name} — MicroNest MicroTools`,
    description: data.description,
    openGraph: {
      title: `${data.name} — MicroNest MicroTools`,
      description: data.description,
    },
  };
}

export default async function ToolPage({ params }: { params: Promise<{ tool: string }> }) {
  const { tool } = await params;
  const data = getTool(tool);
  if (!data) notFound();
  const profession = getProfession(data.profession);

  const isMatterVault = data.slug === "mattervault";

  return (
    <div className="mn-marketing">
      <SiteNav />
      <main className="mx-auto max-w-3xl space-y-6 p-6 md:p-8">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{profession ? profession.name : data.profession}</p>
          <h1 className="text-3xl font-bold">{data.name}</h1>
          <Badge variant={data.status === "available" ? "default" : "outline"}>{data.status === "available" ? "Available" : "Coming soon"}</Badge>
        </div>
        <p className="text-muted-foreground">{data.description}</p>

        <section className="rounded-md border bg-card p-6">
          <div className="h-px w-8 bg-primary/20" aria-hidden="true" />
          <h2 className="text-lg font-semibold tracking-tight">What it does</h2>
          {isMatterVault ? (
            <>
              <p className="mt-2 text-sm text-muted-foreground">
                MatterVault helps Indian litigators collect client documents against a checklist, verify each item, and know
                when the file set is ready to file — without spreadsheets.
              </p>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                <li>Matter management with type, client, status, assigned, deadline and next action</li>
                <li>Checklist templates per matter type (civil, criminal, negotiable instrument, rent, recovery, other)</li>
                <li>Document collection with private bucket, 10 MB PDF/JPG/PNG/DOCX and checklist linkage</li>
                <li>Notes and activity with verify/reject and ready signal</li>
                <li>Matter list with readiness (Required: x/y) and dashboard overview</li>
              </ul>
            </>
          ) : (
            <>
              <p className="mt-2 text-sm text-muted-foreground">
                NoticeFlow helps CAs track GST and income-tax notices from receipt to closure without spreadsheets. It organizes the
                workflow, not the professional judgment.
              </p>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                <li>Notice management with client, authority, type, deadline, priority</li>
                <li>Client support with archive</li>
                <li>Assignment and status workflow (13 transitions)</li>
                <li>Activity history, documents (private bucket), notes</li>
                <li>Dashboard, search/filtering, pagination, CSV export</li>
              </ul>
            </>
          )}
        </section>

        <section className="rounded-md border bg-card p-6">
          <div className="h-px w-8 bg-primary/20" aria-hidden="true" />
          <h2 className="text-lg font-semibold tracking-tight">Who it is for</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {isMatterVault ? "Indian litigators and small law firms — solo and partnership." : "Indian Chartered Accountants, solo CAs and small firms."}
          </p>
        </section>

        <div className="flex gap-3">
          <Link href={data.appHref} className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 active:bg-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            Launch {data.name}
          </Link>
          <Link
            href={profession ? `/profession/${profession.slug}` : "/"}
            className="inline-flex h-9 items-center rounded-md border border-input bg-background px-4 text-sm font-medium hover:bg-accent hover:text-accent-foreground hover:border-primary/20 active:bg-accent/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            View {profession ? profession.name : "profession"} tools
          </Link>
        </div>

        <p className="text-xs text-muted-foreground">
          {isMatterVault
            ? "MatterVault organizes workflow. Professional judgment remains with counsel."
            : "NoticeFlow organizes workflow. Professional judgment remains with your CA."}
        </p>
      </main>
    </div>
  );
}
