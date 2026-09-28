import { createServerSupabaseClient } from "@/infrastructure/database/supabase-server";
import { getCurrentFirmForSession } from "@/modules/firm/services/get-current-firm";

export async function getRecentActivity(limit = 8) {
  const { firm } = await getCurrentFirmForSession();
  if (!firm) return [];
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("activity_log")
    .select("id, notice_id, actor_id, action, from_status, to_status, created_at")
    .eq("firm_id", firm.id)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);

  // Enrich notice reference
  const noticeIds = [...new Set((data ?? []).map((a) => a.notice_id))];
  let noticeMap = new Map<string, string>();
  if (noticeIds.length > 0) {
    const { data: notices } = await supabase.from("notices").select("id, reference_number").in("id", noticeIds);
    noticeMap = new Map((notices ?? []).map((n) => [n.id, (n.reference_number as string) ?? n.id.slice(0, 8)]));
  }

  return (data ?? []).map((a) => ({
    ...a,
    noticeRef: noticeMap.get(a.notice_id) ?? a.notice_id.slice(0, 8),
  }));
}
