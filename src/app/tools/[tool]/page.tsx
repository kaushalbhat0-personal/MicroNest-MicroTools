import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getTool, tools } from "@/content/microtools";
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

  return (
    <>
      <SiteNav />
      <main className="mx-auto max-w-3xl space-y-6 p-6 md:p-8">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Chartered Accountants</p>
          <h1 className="text-3xl font-bold">{data.name}</h1>
          <Badge variant={data.status === "available" ? "default" : "outline"}>{data.status === "available" ? "Available" : "Coming soon"}</Badge>
        </div>
        <p className="text-muted-foreground">{data.description}</p>

        <section className="rounded-md border p-6">
          <h2 className="text-lg font-semibold">What it does</h2>
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
        </section>

        <section className="rounded-md border p-6">
          <h2 className="text-lg font-semibold">Who it is for</h2>
          <p className="mt-2 text-sm text-muted-foreground">Indian Chartered Accountants, solo CAs and small firms.</p>
        </section>

        <div className="flex gap-3">
          <Link href={data.appHref} className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">
            Launch {data.name}
          </Link>
          <Link href="/profession/chartered-accountants" className="inline-flex h-9 items-center rounded-md border px-4 text-sm font-medium">
            View Chartered Accountants tools
          </Link>
        </div>

        <p className="text-xs text-muted-foreground">NoticeFlow organizes workflow. Professional judgment remains with your CA.</p>
      </main>
    </>
  );
}
