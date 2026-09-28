import { createServerSupabaseClient } from "@/infrastructure/database/supabase-server";
import { createServiceSupabaseClient } from "@/infrastructure/database/supabase-service";
import { getCurrentFirmForSession } from "@/modules/firm/services/get-current-firm";
import { getMembershipRole } from "@/modules/firm/permissions/get-membership";
import { canDeleteNote } from "../permissions/note-permissions";
import { deleteNoteRow, getNoteById } from "../repositories/note-repository";
import { getNoticeById } from "@/modules/notice/repositories/notice-repository";

export async function deleteNoteForCurrentFirm(noteId: string) {
  const { user, firm } = await getCurrentFirmForSession();
  if (!user) return { error: "Not authenticated" };
  if (!firm) return { error: "No firm" };

  const supabase = await createServerSupabaseClient();
  const note = await getNoteById(supabase, noteId);
  if (!note || note.firm_id !== firm.id) return { error: "Note not found in your firm" };

  const notice = await getNoticeById(supabase, note.notice_id);
  if (!notice || notice.firm_id !== firm.id) return { error: "Notice not found" };

  const role = await getMembershipRole(firm.id);
  if (!canDeleteNote(role as never, user.id, notice.assigned_to, note.author_id)) return { error: "Not allowed" };

  const service = createServiceSupabaseClient();
  await deleteNoteRow(service, noteId);
  return { ok: true };
}
