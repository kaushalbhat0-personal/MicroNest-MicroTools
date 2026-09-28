import { createServerSupabaseClient } from "@/infrastructure/database/supabase-server";
import { createServiceSupabaseClient } from "@/infrastructure/database/supabase-service";
import { getCurrentFirmForSession } from "@/modules/firm/services/get-current-firm";
import { getMembershipRole } from "@/modules/firm/permissions/get-membership";
import { canCreateNote } from "../permissions/note-permissions";
import { createNoteSchema } from "../schemas/note-schema";
import { getNoticeById } from "@/modules/notice/repositories/notice-repository";
import { insertNote } from "../repositories/note-repository";

export async function createNoteForCurrentFirm(raw: unknown) {
  const parsed = createNoteSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Fix validation errors", fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }
  const { user, firm } = await getCurrentFirmForSession();
  if (!user) return { error: "Not authenticated" };
  if (!firm) return { error: "No firm" };

  const supabase = await createServerSupabaseClient();
  const notice = await getNoticeById(supabase, parsed.data.noticeId);
  if (!notice || notice.firm_id !== firm.id) return { error: "Notice not found in your firm" };

  const role = await getMembershipRole(firm.id);
  if (!canCreateNote(role as never, user.id, notice.assigned_to)) return { error: "Not allowed" };

  // Use service client to bypass RLS (since RLS has no direct insert)
  const service = createServiceSupabaseClient();
  const note = await insertNote(service, {
    firm_id: firm.id,
    notice_id: notice.id,
    author_id: user.id,
    content: parsed.data.content.trim(),
  });
  return { note };
}
