import { createServerSupabaseClient } from "@/infrastructure/database/supabase-server";
import { createServiceSupabaseClient } from "@/infrastructure/database/supabase-service";
import { getCurrentFirmForSession } from "@/modules/firm/services/get-current-firm";
import { getMembershipRole } from "@/modules/firm/permissions/get-membership";
import { requireEntitlement } from "@/modules/billing/services/entitlements";
import { canEditNote } from "../permissions/note-permissions";
import { updateNoteSchema } from "../schemas/note-schema";
import { getNoteById, updateNoteContent } from "../repositories/note-repository";
import { getNoticeById } from "@/modules/notice/repositories/notice-repository";

export async function updateNoteForCurrentFirm(raw: unknown) {
  const parsed = updateNoteSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Fix validation errors", fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }
  const { user, firm } = await getCurrentFirmForSession();
  if (!user) return { error: "Not authenticated" };
  if (!firm) return { error: "No firm" };

  try {
    await requireEntitlement(firm.id, "noticeflow");
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Not subscribed";
    return { error: msg };
  }

  const supabase = await createServerSupabaseClient();
  const note = await getNoteById(supabase, parsed.data.id);
  if (!note || note.firm_id !== firm.id) return { error: "Note not found in your firm" };

  const notice = await getNoticeById(supabase, note.notice_id);
  if (!notice || notice.firm_id !== firm.id) return { error: "Notice not found" };

  const role = await getMembershipRole(firm.id);
  if (!canEditNote(role as never, user.id, notice.assigned_to, note.author_id)) return { error: "Not allowed" };

  const service = createServiceSupabaseClient();
  const updated = await updateNoteContent(service, parsed.data.id, parsed.data.content.trim());
  return { note: updated };
}
