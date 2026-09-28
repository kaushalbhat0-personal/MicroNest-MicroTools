import { createServerSupabaseClient } from "@/infrastructure/database/supabase-server";
import { getCurrentFirmForSession } from "@/modules/firm/services/get-current-firm";

export async function archiveMatterForCurrentFirm(matterId: string) {
  const { user, firm } = await getCurrentFirmForSession();
  if (!user) return { error: "Not authenticated" };
  if (!firm) return { error: "No firm" };
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.rpc("archive_matter", { p_matter_id: matterId });
  if (error) return { error: error.message };
  return { ok: true };
}
