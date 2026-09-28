import Link from "next/link";
import { MattersTable } from "@/modules/matter/components/matters-table";
import { listMattersForCurrentFirm } from "@/modules/matter/services/list-matters";
import { listClientsForCurrentFirm } from "@/modules/client/services/list-clients";
import type { Client } from "@/modules/client/types/client-types";
import { getCurrentFirmForSession } from "@/modules/firm/services/get-current-firm";
import { getMembershipRole } from "@/modules/firm/permissions/get-membership";
import { canCreateMatter } from "@/modules/matter/permissions/matter-permissions";

export const dynamic = "force-dynamic";

export default async function MattersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const status = typeof params.status === "string" ? params.status : undefined;
  const allowed = ["open", "ready", "archived"] as const;
  const statusFilter = allowed.includes(status as never) ? (status as (typeof allowed)[number]) : undefined;

  const matters = await listMattersForCurrentFirm(statusFilter);
  const clients = await listClientsForCurrentFirm(true);
  const map = new Map<string, Client>(clients.map((c) => [c.id, c]));
  const { firm } = await getCurrentFirmForSession();
  const role = firm ? await getMembershipRole(firm.id) : null;
  const canCreate = canCreateMatter(role as never);

  const readinessMap = new Map<string, { requiredCount: number; verifiedCount: number }>();
  if (matters.length > 0 && firm) {
    const { createServerSupabaseClient } = await import("@/infrastructure/database/supabase-server");
    const supabase = await createServerSupabaseClient();
    const { data: items } = await supabase
      .from("checklist_items")
      .select("matter_id, required, status")
      .in(
        "matter_id",
        matters.map((m) => m.id),
      );
    for (const m of matters) readinessMap.set(m.id, { requiredCount: 0, verifiedCount: 0 });
    for (const it of (items ?? []) as { matter_id: string; required: boolean; status: string }[]) {
      if (!it.required) continue;
      const cur = readinessMap.get(it.matter_id)!;
      cur.requiredCount += 1;
      if (it.status === "verified") cur.verifiedCount += 1;
    }
  }

  function hrefFor(s: string | undefined) {
    if (!s) return "/app/matters";
    return `/app/matters?status=${s}`;
  }

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Matters</h1>
        {canCreate && (
          <Link href="/app/matters/new" className="rounded-md border px-3 py-1 text-sm">
            New matter
          </Link>
        )}
      </div>
      <div className="flex gap-2 text-sm">
        <Link href={hrefFor(undefined)} className={`rounded-md border px-3 py-1 ${!statusFilter ? "bg-foreground text-background" : ""}`}>
          All
        </Link>
        <Link href={hrefFor("open")} className={`rounded-md border px-3 py-1 ${statusFilter === "open" ? "bg-foreground text-background" : ""}`}>
          Open
        </Link>
        <Link href={hrefFor("ready")} className={`rounded-md border px-3 py-1 ${statusFilter === "ready" ? "bg-foreground text-background" : ""}`}>
          Ready
        </Link>
        <Link href={hrefFor("archived")} className={`rounded-md border px-3 py-1 ${statusFilter === "archived" ? "bg-foreground text-background" : ""}`}>
          Archived
        </Link>
      </div>
      <MattersTable matters={matters} clientsMap={map} readinessMap={readinessMap} />
    </main>
  );
}
