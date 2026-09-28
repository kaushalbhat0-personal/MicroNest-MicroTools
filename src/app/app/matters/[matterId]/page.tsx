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
  const checklist = await listChecklistByMatter(supabase, matter.id);
  const documents = await listDocumentsByMatter(supabase, matter.id);
  const notes = await listNotesByMatter(supabase, matter.id);
  const activities = await listActivitiesByMatter(supabase, matter.id);

  const canEdit = canEditMatter(role as never, user?.id ?? null, matter.assigned_to);
  const canArchive = canArchiveMatter(role as never) && (matter.status === "open" || matter.status === "ready") && canTransitionMatter(matter.status as never, "archived");
  const canUpload = canUploadToMatter(role as never, user?.id ?? null, matter.assigned_to);
  const canNote = canCreateMatterNote(role as never, user?.id ?? null, matter.assigned_to);

  return (
    <main className="mx-auto max-w-3xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{matter.title}</h1>
        <Badge>{matter.status}</Badge>
      </div>

      <div className="grid grid-cols-2 gap-4 rounded-md border p-4 text-sm">
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
          <p className="font-mono text-xs">{matter.assigned_to ?? "Unassigned"}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Deadline</p>
          <p>{matter.deadline ?? "—"}</p>
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

      <div className="flex gap-2">
        {canEdit && (
          <Link href={`/app/matters/${matter.id}/edit`} className="inline-flex rounded-md border px-3 py-1 text-sm">
            Edit
          </Link>
        )}
        {canArchive && <ArchiveMatterButton matterId={matter.id} />}
      </div>
      <Link href="/app/matters" className="text-sm text-muted-foreground underline">
        ← Back to matters
      </Link>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Checklist</h2>
        <Checklist items={checklist} canVerify={canVerifyChecklist(role as never)} />
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
    </main>
  );
}
