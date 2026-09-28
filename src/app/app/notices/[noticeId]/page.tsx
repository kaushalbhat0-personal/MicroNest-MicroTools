import Link from "next/link";
import { notFound } from "next/navigation";
import { getNoticeForCurrentFirm } from "@/modules/notice/services/get-notice";
import { createServerSupabaseClient } from "@/infrastructure/database/supabase-server";
import { getClientById } from "@/modules/client/repositories/client-repository";
import { getCurrentFirmForSession } from "@/modules/firm/services/get-current-firm";
import { listMembersByFirm } from "@/modules/firm/repositories/firm-repository";
import { getMembershipRole } from "@/modules/firm/permissions/get-membership";
import { Badge } from "@/components/ui/badge";
import { WorkflowControl } from "@/modules/notice/components/workflow-control";
import { listActivitiesByNotice } from "@/modules/activity/repositories/activity-repository";
import { ActivityTimeline } from "@/modules/activity/components/activity-timeline";
import { listDocumentsByNotice } from "@/modules/document/repositories/document-repository";
import { DocumentsList } from "@/modules/document/components/documents-list";
import { UploadForm } from "@/modules/document/components/upload-form";
import { listNotesByNotice } from "@/modules/note/repositories/note-repository";
import { NotesList } from "@/modules/note/components/notes-list";
import { NoteForm } from "@/modules/note/components/note-form";
import { canDeleteDocument } from "@/modules/document/permissions/document-permissions";

export const dynamic = "force-dynamic";

export default async function NoticeDetailPage({ params }: { params: Promise<{ noticeId: string }> }) {
  const { noticeId } = await params;
  const notice = await getNoticeForCurrentFirm(noticeId);
  if (!notice) notFound();

  const supabase = await createServerSupabaseClient();
  const client = await getClientById(supabase, notice.client_id);
  const { firm, user } = await getCurrentFirmForSession();
  const members = firm ? await listMembersByFirm(supabase, firm.id) : [];
  const role = firm ? await getMembershipRole(firm.id) : null;
  const activities = await listActivitiesByNotice(supabase, notice.id);
  const documents = await listDocumentsByNotice(supabase, notice.id);
  const notes = await listNotesByNotice(supabase, notice.id);

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Notice {notice.reference_number ?? notice.id.slice(0, 8)}</h1>
        <Badge>{notice.status}</Badge>
      </div>

      <div className="grid grid-cols-1 gap-4 rounded-md border p-4 text-sm md:grid-cols-2">
        <div>
          <p className="text-muted-foreground">Client</p>
          <p>{client?.name ?? notice.client_id}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Authority</p>
          <p>{notice.authority}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Type</p>
          <p>{notice.notice_type}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Priority</p>
          <p>{notice.priority}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Received</p>
          <p>{notice.received_date ?? "—"}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Deadline</p>
          <p>
            {notice.response_deadline}{" "}
            <span className="text-xs font-medium">
              {(() => {
                const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
                const d = new Date(notice.response_deadline + "T00:00:00");
                const t = new Date(today + "T00:00:00");
                const diff = Math.round((d.getTime() - t.getTime()) / 86400000);
                if (diff < 0) return `OVERDUE · ${Math.abs(diff)} days late`;
                if (diff === 0) return "DUE TODAY";
                if (diff <= 7) return `DUE IN ${diff} DAYS`;
                return "";
              })()}
            </span>
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">Assigned</p>
          <p className="font-mono text-xs">{notice.assigned_to ?? "Unassigned"}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Next action</p>
          <p>{notice.next_action ?? "—"}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Next action date</p>
          <p>{notice.next_action_date ?? "—"}</p>
        </div>
      </div>

      <Link href={`/app/notices/${notice.id}/edit`} className="inline-flex rounded-md border px-3 py-1 text-sm">
        Edit
      </Link>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Workflow</h2>
        <WorkflowControl
          noticeId={notice.id}
          currentStatus={notice.status}
          currentAssignedTo={notice.assigned_to}
          role={role}
          actorUserId={user?.id ?? null}
          members={members}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Activity</h2>
        <ActivityTimeline activities={activities} />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Documents</h2>
        <DocumentsList documents={documents} noticeId={notice.id} canDelete={canDeleteDocument(role as never)} />
        <UploadForm noticeId={notice.id} />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Notes</h2>
        <NotesList notes={notes} currentUserId={user?.id ?? null} currentRole={role} noticeAssignedTo={notice.assigned_to} />
        <NoteForm noticeId={notice.id} />
      </section>
      </div>
    </main>
  );
}
