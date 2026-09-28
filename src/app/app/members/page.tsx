import { createServerSupabaseClient } from "@/infrastructure/database/supabase-server";
import { listMembersForCurrentFirm } from "@/modules/firm/services/list-firm-members";
import { MembersTable } from "@/modules/firm/components/members-table";

export const dynamic = "force-dynamic";

export default async function MembersPage() {
  const { firm, members } = await listMembersForCurrentFirm();
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="mx-auto max-w-3xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Members</h1>
        <p className="text-sm text-muted-foreground">Firm: {firm.name} — role management (owner/admin only)</p>
      </div>
      <MembersTable members={members} currentUserId={user?.id ?? null} />
      <p className="text-sm text-muted-foreground">Owner role is immutable in Phase 1B; cannot promote to owner.</p>
    </main>
  );
}
