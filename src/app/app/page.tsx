import Link from "next/link";
import { getCurrentFirmForSession } from "@/modules/firm/services/get-current-firm";
import { signOutAction } from "@/modules/auth/actions/sign-out";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getMembershipRole } from "@/modules/firm/permissions/get-membership";
import { isSubscribed } from "@/modules/billing/services/entitlements";
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

  const isNoticeflowSubscribed = firm ? await isSubscribed(firm.id, "noticeflow") : false;
  const isMattervaultSubscribed = firm ? await isSubscribed(firm.id, "mattervault") : false;

  const summary = isNoticeflowSubscribed ? await getDashboardSummary() : null;
  const attention = isNoticeflowSubscribed ? await getAttentionNotices(5) : [];
  const recent = isNoticeflowSubscribed ? await getRecentActivity(5) : [];
  const hasNotices = summary ? summary.open > 0 || summary.overdue > 0 || summary.dueSoon > 0 : false;
  const matterSummary = isMattervaultSubscribed ? await getMatterDashboardSummary() : null;

  return (
    <main className="mx-auto max-w-6xl space-y-8 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Firm workspace</h1>
          <p className="text-sm text-muted-foreground">
            {firm?.name} — {firm?.slug}
          </p>
        </div>
        <Badge>{firm?.status}</Badge>
      </div>

      <div className="rounded-md border p-4">
        <p className="text-sm">
          Signed in as <span className="font-medium">{user?.email}</span>
        </p>
        <p className="text-sm text-muted-foreground">Role: {role ? role.toUpperCase() : "—"}</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Firm</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Link href="/app/clients" className="rounded-md border p-4 hover:bg-accent">
            <p className="text-sm font-medium">Clients</p>
            <p className="text-xs text-muted-foreground">Firm roster — shared across MicroTools</p>
          </Link>
          <Link href="/app/members" className="rounded-md border p-4 hover:bg-accent">
            <p className="text-sm font-medium">Members</p>
            <p className="text-xs text-muted-foreground">Roles and access</p>
          </Link>
          <Link href="/app/settings" className="rounded-md border p-4 hover:bg-accent">
            <p className="text-sm font-medium">Settings</p>
            <p className="text-xs text-muted-foreground">Firm and account</p>
          </Link>
          <Link href="/app/billing" className="rounded-md border p-4 hover:bg-accent">
            <p className="text-sm font-medium">Billing</p>
            <p className="text-xs text-muted-foreground">Subscriptions and plans</p>
          </Link>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">MicroTools</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* NoticeFlow */}
          {isNoticeflowSubscribed ? (
            <div className="space-y-3 rounded-md border p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold">NoticeFlow</h3>
                <Badge>Subscribed</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Notice workflow for CA firms — track GST and income-tax notices from receipt to closure.
              </p>
              {summary && <SummaryCards summary={summary} />}
              {summary && (
                <div className="flex gap-2">
                  <Link href="/app/notices" className="inline-flex rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground">
                    Open NoticeFlow
                  </Link>
                  <Link href="/app/notices/new" className="inline-flex rounded-md border px-3 py-1.5 text-sm">
                    New notice
                  </Link>
                </div>
              )}
              {attention.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Needs attention</p>
                  <AttentionList notices={attention.slice(0, 3)} />
                </div>
              )}
              {!hasNotices && summary && (
                <p className="text-sm text-muted-foreground">No open notices. Create your first notice to start tracking.</p>
              )}
            </div>
          ) : (
            <div className="space-y-3 rounded-md border border-dashed p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold">NoticeFlow</h3>
                <Badge variant="outline">Not subscribed</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Notice workflow for CA firms — track GST and income-tax notices from receipt to closure.
              </p>
              <Link href="/app/billing" className="inline-flex rounded-md border px-3 py-1.5 text-sm">
                Explore NoticeFlow
              </Link>
            </div>
          )}

          {/* MatterVault */}
          {isMattervaultSubscribed ? (
            <div className="space-y-3 rounded-md border p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold">MatterVault</h3>
                <Badge>Subscribed</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Client document collection and matter file organization for litigators — from checklist to ready file.</p>
              {matterSummary && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-md border p-3">
                    <p className="text-xs text-muted-foreground">Open matters</p>
                    <p className="text-xl font-semibold">{matterSummary.openMatters}</p>
                  </div>
                  <div className="rounded-md border p-3">
                    <p className="text-xs text-muted-foreground">Awaiting documents</p>
                    <p className="text-xl font-semibold">{matterSummary.awaitingDocuments}</p>
                  </div>
                  <div className={`rounded-md border p-3 ${matterSummary.readyMatters > 0 ? "border-green-200 bg-green-50 dark:bg-green-950/20" : ""}`}>
                    <p className="text-xs text-muted-foreground">Ready</p>
                    <p className="text-xl font-semibold">{matterSummary.readyMatters}</p>
                  </div>
                  <div className={`rounded-md border p-3 ${matterSummary.overdueMatters > 0 ? "border-red-200 bg-red-50 dark:bg-red-950/20" : ""}`}>
                    <p className="text-xs text-muted-foreground">Overdue</p>
                    <p className="text-xl font-semibold">{matterSummary.overdueMatters}</p>
                    {matterSummary.overdueMatters > 0 && <p className="text-xs text-red-700 dark:text-red-300">Needs action</p>}
                  </div>
                </div>
              )}
              <Link href="/app/matters" className="inline-flex rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground">
                Open MatterVault
              </Link>
            </div>
          ) : (
            <div className="space-y-3 rounded-md border border-dashed p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold">MatterVault</h3>
                <Badge variant="outline">Not subscribed</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Client document collection and matter file organization for litigators — from checklist to ready file.</p>
              <Link href="/app/billing" className="inline-flex rounded-md border px-3 py-1.5 text-sm">
                Explore MatterVault
              </Link>
            </div>
          )}
        </div>
      </section>

      {isNoticeflowSubscribed && recent.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Recent activity — NoticeFlow</h2>
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
        </section>
      )}

      <form action={signOutAction}>
        <Button variant="outline" type="submit">
          Sign out
        </Button>
      </form>
    </main>
  );
}
