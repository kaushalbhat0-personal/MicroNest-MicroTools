import Link from "next/link";
import { redirect } from "next/navigation";
import { MattersTable } from "@/modules/matter/components/matters-table";
import { listMattersForCurrentFirm } from "@/modules/matter/services/list-matters";
import { listClientsForCurrentFirm } from "@/modules/client/services/list-clients";
import type { Client } from "@/modules/client/types/client-types";
import { getCurrentFirmForSession } from "@/modules/firm/services/get-current-firm";
import { getMembershipRole } from "@/modules/firm/permissions/get-membership";
import { canCreateMatter } from "@/modules/matter/permissions/matter-permissions";
import { PageHeader } from "@/components/layout/page-header";
import { isSubscribed } from "@/modules/billing/services/entitlements";

export const dynamic = "force-dynamic";

export default async function MattersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { firm: guardFirm } = await getCurrentFirmForSession();
  if (guardFirm && !(await isSubscribed(guardFirm.id, "mattervault"))) redirect("/app");
  const params = await searchParams;
  const status = typeof params.status === "string" ? params.status : undefined;
  const allowed = ["open", "ready", "archived"] as const;
  const statusFilter = allowed.includes(status as never) ? (status as (typeof allowed)[number]) : undefined;

  let matters;
  try {
    matters = await listMattersForCurrentFirm(statusFilter);
  } catch (e) {
    if (e instanceof Error && e.name === "EntitlementError") redirect("/app");
    throw e;
  }
  const clients = await listClientsForCurrentFirm(true);
  const map = new Map<string, Client>(clients.map((c) => [c.id, c]));
  const { firm } = await getCurrentFirmForSession();
  const role = firm ? await getMembershipRole(firm.id) : null;
  const canCreate = canCreateMatter(role as never);

  // Build member display map (human-readable) — local, not generic abstraction
  const membersMap = new Map<string, string>();
  if (firm) {
    const { createServerSupabaseClient } = await import("@/infrastructure/database/supabase-server");
    const supabase2 = await createServerSupabaseClient();
    const { data: members } = await supabase2.from("firm_members").select("user_id").eq("firm_id", firm.id);
    const ids = (members ?? []).map((m: { user_id: string }) => m.user_id);
    if (ids.length > 0) {
      try {
        const { createServiceSupabaseClient } = await import("@/infrastructure/database/supabase-service");
        const svc = createServiceSupabaseClient();
        const { data: users } = await svc.from("users").select("id, name, email").in("id", ids);
        for (const u of (users ?? []) as { id: string; name: string | null; email: string }[]) {
          membersMap.set(u.id, u.name?.trim() ? u.name! : u.email);
        }
      } catch {}
    }
  }

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
    <main className="mx-auto max-w-5xl space-y-6 p-6">
      <PageHeader
        title="Matters"
        action={
          canCreate ? (
            <Link href="/app/matters/new" className="rounded-md border px-3 py-1 text-sm">
              New matter
            </Link>
          ) : undefined
        }
      />
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
      <MattersTable matters={matters} clientsMap={map} readinessMap={readinessMap} membersMap={membersMap} />
    </main>
  );
}
