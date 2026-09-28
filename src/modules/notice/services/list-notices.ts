import { createServerSupabaseClient } from "@/infrastructure/database/supabase-server";
import { getCurrentFirmForSession } from "@/modules/firm/services/get-current-firm";
import { listNoticesByFirm } from "../repositories/notice-repository";

export async function listNoticesForCurrentFirm() {
  const { user, firm } = await getCurrentFirmForSession();
  if (!user) throw new Error("Not authenticated");
  if (!firm) throw new Error("No firm");
  const supabase = await createServerSupabaseClient();
  return listNoticesByFirm(supabase, firm.id);
}
