import Link from "next/link";
import { getCurrentFirmForSession } from "@/modules/firm/services/get-current-firm";
import { signOutAction } from "@/modules/auth/actions/sign-out";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getMembershipRole } from "@/modules/firm/permissions/get-membership";
import { getDashboardSummary } from "@/modules/dashboard/services/get-dashboard-summary";
import { SummaryCards } from "@/modules/dashboard/components/summary-cards";
import { getAttentionNotices } from "@/modules/dashboard/services/get-attention-notices";
import { AttentionList } from "@/modules/dashboard/components/attention-list";
import { getRecentActivity } from "@/modules/dashboard/services/get-recent-activity";
import { getMatterDashboardSummary } from "@/modules/matter/services/get-matter-dashboard-summary";

export const dynamic = "force-dynamic";

export default async function AppPage() {
  const { user, firm } = await getCurrentFirmForSession();
  const role = firm ? await getMembershipRole(firm.id) : null;
  const summary = await getDashboardSummary();
  const attention = await getAttentionNotices(8);
  const recent = await getRecentActivity(8);
  const hasNotices = summary.open > 0 || summary.overdue > 0 || summary.dueSoon > 0;
  const matterSummary = await getMatterDashboardSummary();

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Firm: {firm?.name} — {firm?.slug}</p>
        </div>
        <Badge>{firm?.status}</Badge>
      </div>
      <div className="rounded-md border p-4">
        <p className="text-sm">Signed in as {user?.email}</p>
        <p className="text-sm text-muted-foreground">Role: {role ? role.toUpperCase() : "—"}</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Overview</h2>
        <SummaryCards summary={summary} />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">MatterVault</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="rounded-md border p-4">
            <p className="text-sm text-muted-foreground">Open matters</p>
            <p className="text-2xl font-semibold">{matterSummary.openMatters}</p>
          </div>
          <div className="rounded-md border p-4">
            <p className="text-sm text-muted-foreground">Awaiting documents</p>
            <p className="text-2xl font-semibold">{matterSummary.awaitingDocuments}</p>
          </div>
          <div className={`rounded-md border p-4 ${matterSummary.readyMatters > 0 ? "border-green-200 bg-green-50 dark:bg-green-950/20" : ""}`}>
            <p className="text-sm text-muted-foreground">Ready</p>
            <p className="text-2xl font-semibold">{matterSummary.readyMatters}</p>
          </div>
          <div className={`rounded-md border p-4 ${matterSummary.overdueMatters > 0 ? "border-red-200 bg-red-50 dark:bg-red-950/20" : ""}`}>
            <p className="text-sm text-muted-foreground">Overdue</p>
            <p className="text-2xl font-semibold">{matterSummary.overdueMatters}</p>
            {matterSummary.overdueMatters > 0 && <p className="text-xs text-red-700 dark:text-red-300">Needs action</p>}
          </div>
        </div>
        <Link href="/app/matters" className="inline-flex rounded-md border px-3 py-1 text-sm">View matters</Link>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Needs Attention</h2>
        <AttentionList notices={attention} />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Recent Activity</h2>
        {recent.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recent activity.</p>
        ) : (
          <ul className="space-y-2">
            {recent.map((a) => (
              <li key={a.id} className="rounded-md border p-3 text-sm">
                <p>
                  <span className="font-medium">{a.action}</span> — {a.from_status} → {a.to_status} • {a.noticeRef}
                </p>
                <p className="text-xs text-muted-foreground">
                  by {String(a.actor_id).slice(0, 8)} • {new Date(a.created_at).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {!hasNotices && (
        <div className="rounded-md border p-4 text-sm">
          <p>No notices yet. Create your first notice to start tracking deadlines and workflow.</p>
          <Link href="/app/notices/new" className="mt-2 inline-flex rounded-md border px-3 py-1">
            Create Notice
          </Link>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Link href="/app/members" className="inline-flex h-9 items-center rounded-md border px-4 text-sm font-medium">
          Members
        </Link>
        <Link href="/app/clients" className="inline-flex h-9 items-center rounded-md border px-4 text-sm font-medium">
          Clients
        </Link>
        <Link href="/app/notices" className="inline-flex h-9 items-center rounded-md border px-4 text-sm font-medium">
          Notices
        </Link>
        <form action={signOutAction}>
          <Button variant="outline" type="submit">
            Sign out
          </Button>
        </form>
      </div>
    </main>
  );
}
