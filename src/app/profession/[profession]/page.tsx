import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProfession, professions } from "@/content/microtools";
import { ToolCard } from "@/components/marketing/tool-card";
import { SiteNav } from "@/components/layout/site-nav";

export function generateStaticParams() {
  return professions.map((p) => ({ profession: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ profession: string }> }): Promise<Metadata> {
  const { profession } = await params;
  const data = getProfession(profession);
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

export default async function ProfessionPage({ params }: { params: Promise<{ profession: string }> }) {
  const { profession } = await params;
  const data = getProfession(profession);
  if (!data) notFound();

  return (
    <div className="mn-marketing">
      <SiteNav />
      <main className="mx-auto max-w-6xl space-y-8 p-6 md:p-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{data.name}</h1>
          <p className="text-muted-foreground">{data.description}</p>
        </div>
        <section className="space-y-4">
          <div className="h-px w-8 bg-primary/20" aria-hidden="true" />
          <h2 className="text-2xl font-semibold tracking-tight">MicroTools for {data.name}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {data.tools.map((t) => (
              <ToolCard key={t.slug} tool={t} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
