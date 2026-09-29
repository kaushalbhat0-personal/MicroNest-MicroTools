import { getCurrentFirmForSession } from "@/modules/firm/services/get-current-firm";
import { getMembershipRole } from "@/modules/firm/permissions/get-membership";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const { user, firm } = await getCurrentFirmForSession();
  const role = firm ? await getMembershipRole(firm.id) : null;

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-6">
      <PageHeader title="Settings" description="Firm and account" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-md border p-4 space-y-3">
          <h3 className="text-sm font-medium">Firm</h3>
          <div className="space-y-1 text-sm">
            <p>
              <span className="text-muted-foreground">Name:</span> {firm?.name ?? "—"}
            </p>
            <p>
              <span className="text-muted-foreground">Slug:</span> {firm?.slug ?? "—"}
            </p>
            <p className="flex items-center gap-2">
              <span className="text-muted-foreground">Status:</span> <Badge>{firm?.status ?? "—"}</Badge>
            </p>
            <p>
              <span className="text-muted-foreground">Country:</span> {firm?.country ?? "IN"}
            </p>
            <p>
              <span className="text-muted-foreground">Timezone:</span> {firm?.timezone ?? "Asia/Kolkata"}
            </p>
          </div>
        </div>
        <div className="rounded-md border p-4 space-y-3">
          <h3 className="text-sm font-medium">Account</h3>
          <div className="space-y-1 text-sm">
            <p>
              <span className="text-muted-foreground">Email:</span> {user?.email ?? "—"}
            </p>
            <p>
              <span className="text-muted-foreground">Role:</span> {role ? role.toUpperCase() : "—"}
            </p>
            <p>
              <span className="text-muted-foreground">User ID:</span> <span className="font-mono text-xs">{user?.id?.slice(0, 8) ?? "—"}</span>
            </p>
          </div>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">Firm settings are minimal in P2. Billing and member management are under Firm → Billing and Members.</p>
    </main>
  );
}
