import { listClientsForCurrentFirm } from "@/modules/client/services/list-clients";
import { createNoticeAction } from "@/modules/notice/actions/create-notice";
import { NoticeForm } from "@/modules/notice/components/notice-form";
import { createServerSupabaseClient } from "@/infrastructure/database/supabase-server";
import { getCurrentFirmForSession } from "@/modules/firm/services/get-current-firm";
import { listMembersByFirm } from "@/modules/firm/repositories/firm-repository";

export const dynamic = "force-dynamic";

export default async function NewNoticePage() {
  const clients = await listClientsForCurrentFirm();
  const { firm } = await getCurrentFirmForSession();
  const supabase = await createServerSupabaseClient();
  const members = firm ? await listMembersByFirm(supabase, firm.id) : [];

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-semibold">New notice</h1>
        <NoticeForm action={createNoticeAction} clients={clients} members={members} submitLabel="Create" />
      </div>
    </main>
  );
}
