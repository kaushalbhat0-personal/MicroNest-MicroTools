import { createServerSupabaseClient } from "@/infrastructure/database/supabase-server";
import { getCurrentFirmForSession } from "@/modules/firm/services/get-current-firm";
import { getNoticeById } from "../repositories/notice-repository";

export async function getNoticeForCurrentFirm(noticeId: string) {
  const { user, firm } = await getCurrentFirmForSession();
  if (!user) throw new Error("Not authenticated");
  if (!firm) throw new Error("No firm");
  const supabase = await createServerSupabaseClient();
  const notice = await getNoticeById(supabase, noticeId);
  if (!notice || notice.firm_id !== firm.id) return null; // IDOR guard
  return notice;
}
