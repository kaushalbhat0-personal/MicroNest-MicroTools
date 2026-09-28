import { notFound } from "next/navigation";
import { getNoticeForCurrentFirm } from "@/modules/notice/services/get-notice";
import { updateNoticeAction } from "@/modules/notice/actions/update-notice";
import { NoticeForm } from "@/modules/notice/components/notice-form";
import { listClientsForCurrentFirm } from "@/modules/client/services/list-clients";
import { createServerSupabaseClient } from "@/infrastructure/database/supabase-server";
import { getCurrentFirmForSession } from "@/modules/firm/services/get-current-firm";
import { listMembersByFirm } from "@/modules/firm/repositories/firm-repository";

export const dynamic = "force-dynamic";

export default async function EditNoticePage({ params }: { params: Promise<{ noticeId: string }> }) {
  const { noticeId } = await params;
  const notice = await getNoticeForCurrentFirm(noticeId);
  if (!notice) notFound();

  const clients = await listClientsForCurrentFirm(true);
  const { firm } = await getCurrentFirmForSession();
  const supabase = await createServerSupabaseClient();
  const members = firm ? await listMembersByFirm(supabase, firm.id) : [];

  return (
    <main className="mx-auto max-w-2xl space-y-6 p-6">
      <h1 className="text-2xl font-semibold">Edit notice</h1>
      <NoticeForm
        action={updateNoticeAction}
        clients={clients}
        members={members}
        defaultValues={{
          id: notice.id,
          client_id: notice.client_id,
          reference_number: notice.reference_number,
          authority: notice.authority,
          notice_type: notice.notice_type,
          received_date: notice.received_date,
          response_deadline: notice.response_deadline,
          priority: notice.priority,
          assigned_to: notice.assigned_to,
          next_action: notice.next_action,
          next_action_date: notice.next_action_date,
        }}
        submitLabel="Save"
      />
    </main>
  );
}
