import Link from "next/link";
import { notFound } from "next/navigation";
import { getMatterForCurrentFirm } from "@/modules/matter/services/get-matter";
import { createServerSupabaseClient } from "@/infrastructure/database/supabase-server";
import { getClientById } from "@/modules/client/repositories/client-repository";
import { getCurrentFirmForSession } from "@/modules/firm/services/get-current-firm";
import { listMembersByFirm } from "@/modules/firm/repositories/firm-repository";
import { getMembershipRole } from "@/modules/firm/permissions/get-membership";
import { Badge } from "@/components/ui/badge";
import { listChecklistByMatter } from "@/modules/matter/repositories/checklist-repository";
import { Checklist } from "@/modules/matter/components/checklist";
import { listDocumentsByMatter } from "@/modules/matter/repositories/matter-document-repository";
import { MatterDocumentsList } from "@/modules/matter/components/matter-documents-list";
import { MatterUploadForm } from "@/modules/matter/components/matter-upload-form";
import { listNotesByMatter } from "@/modules/matter/repositories/matter-note-repository";
import { MatterNotesList } from "@/modules/matter/components/matter-notes-list";
import { MatterNoteForm } from "@/modules/matter/components/matter-note-form";
import { listActivitiesByMatter } from "@/modules/matter/repositories/matter-activity-repository";
import { MatterActivityTimeline } from "@/modules/matter/components/matter-activity-timeline";
import {
  canVerifyChecklist,
  canEditMatter,
  canArchiveMatter,
  canUploadToMatter,
  canCreateMatterNote,
} from "@/modules/matter/permissions/matter-permissions";
import { canTransitionMatter } from "@/modules/matter/permissions/matter-status";
import { ArchiveMatterButton } from "@/modules/matter/components/archive-matter-button";
import { PageHeader } from "@/components/layout/page-header";

export const dynamic = "force-dynamic";

export default async function MatterDetailPage({ params }: { params: Promise<{ matterId: string }> }) {
  const { matterId } = await params;
  const matter = await getMatterForCurrentFirm(matterId);
  if (!matter) notFound();

  const supabase = await createServerSupabaseClient();
  const client = await getClientById(supabase, matter.client_id);
  const { firm, user } = await getCurrentFirmForSession();
  const members = firm ? await listMembersByFirm(supabase, firm.id) : [];
  void members;
  const role = firm ? await getMembershipRole(firm.id) : null;

  // Human-readable assigned name — local map, not generic abstraction
  let assignedDisplay = "Unassigned";
  if (matter.assigned_to) {
    try {
      const { createServiceSupabaseClient } = await import("@/infrastructure/database/supabase-service");
      const svc = createServiceSupabaseClient();
      const { data: u } = await svc.from("users").select("name, email").eq("id", matter.assigned_to).maybeSingle();
      if (u) assignedDisplay = (u as { name: string | null; email: string }).name?.trim() ? (u as { name: string | null }).name! : (u as { email: string }).email;
      else assignedDisplay = matter.assigned_to.slice(0, 8);
    } catch {
      assignedDisplay = matter.assigned_to.slice(0, 8);
    }
  }
  const checklist = await listChecklistByMatter(supabase, matter.id);
  const documents = await listDocumentsByMatter(supabase, matter.id);
  const notes = await listNotesByMatter(supabase, matter.id);
  const activities = await listActivitiesByMatter(supabase, matter.id);

  const canEdit = canEditMatter(role as never, user?.id ?? null, matter.assigned_to);
  const canArchive = canArchiveMatter(role as never) && (matter.status === "open" || matter.status === "ready") && canTransitionMatter(matter.status as never, "archived");
  const canUpload = canUploadToMatter(role as never, user?.id ?? null, matter.assigned_to);
  const canNote = canCreateMatterNote(role as never, user?.id ?? null, matter.assigned_to);

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title={matter.title}
        description={`${client?.name ?? matter.client_id} • ${matter.matter_type}`}
        backHref="/app/matters"
        backLabel="Back to matters"
        action={
          <div className="flex items-center gap-2">
            <Badge>{matter.status}</Badge>
            {canEdit && (
              <Link href={`/app/matters/${matter.id}/edit`} className="inline-flex rounded-md border px-3 py-1 text-sm">
                Edit
              </Link>
            )}
            {canArchive && <ArchiveMatterButton matterId={matter.id} />}
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-md border p-4 space-y-3">
          <h3 className="text-sm font-medium">Details</h3>
          <div className="space-y-2 text-sm">
            <div>
              <p className="text-muted-foreground">Client</p>
              <p>{client?.name ?? matter.client_id}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Matter Type</p>
              <p>{matter.matter_type}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Assigned</p>
              <p className="text-sm">{assignedDisplay}</p>
            </div>
          </div>
        </div>
        <div className="rounded-md border p-4 space-y-3">
          <h3 className="text-sm font-medium">Schedule</h3>
          <div className="space-y-2 text-sm">
            <div>
              <p className="text-muted-foreground">Deadline</p>
              <p>
                {matter.deadline ?? "—"}{" "}
                {matter.deadline && (
                  <span className={`text-xs font-medium ${(() => {
                    const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
                    const d = new Date(matter.deadline! + "T00:00:00");
                    const t = new Date(today + "T00:00:00");
                    const diff = Math.round((d.getTime() - t.getTime()) / 86400000);
                    if (diff < 0) return "text-red-600";
                    if (diff === 0) return "text-amber-600";
                    if (diff <= 7) return "text-amber-600";
                    return "text-muted-foreground";
                  })()}`}>
                    {(() => {
                      const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
                      const d = new Date(matter.deadline! + "T00:00:00");
                      const t = new Date(today + "T00:00:00");
                      const diff = Math.round((d.getTime() - t.getTime()) / 86400000);
                      if (diff < 0) return `OVERDUE · ${Math.abs(diff)} days late`;
                      if (diff === 0) return "DUE TODAY";
                      if (diff <= 7) return `DUE IN ${diff} DAYS`;
                      return "";
                    })()}
                  </span>
                )}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Next action</p>
              <p>{matter.next_action ?? "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Next action date</p>
              <p>{matter.next_action_date ?? "—"}</p>
            </div>
          </div>
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Checklist</h2>
        <Checklist items={checklist} canVerify={canVerifyChecklist(role as never)} canUpload={canUpload} matterId={matter.id} />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Documents</h2>
        <MatterDocumentsList
          documents={documents}
          matterId={matter.id}
          canDelete={canUpload}
          currentUserId={user?.id ?? null}
          currentRole={role}
          matterAssignedTo={matter.assigned_to}
        />
        {canUpload ? (
          <MatterUploadForm matterId={matter.id} checklistItems={checklist} />
        ) : (
          <p className="text-sm text-muted-foreground">Assigned member only — you do not have upload permission for this matter.</p>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Notes</h2>
        <MatterNotesList
          notes={notes}
          currentUserId={user?.id ?? null}
          currentRole={role as never}
          matterAssignedTo={matter.assigned_to}
        />
        {canNote ? (
          <MatterNoteForm matterId={matter.id} />
        ) : (
          <p className="text-sm text-muted-foreground">Assigned member only — you do not have permission to add notes to this matter.</p>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Activity</h2>
        <MatterActivityTimeline activities={activities} />
      </section>
      </div>
    </main>
  );
}
