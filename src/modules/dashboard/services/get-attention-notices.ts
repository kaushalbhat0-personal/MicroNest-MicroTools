import { createServerSupabaseClient } from "@/infrastructure/database/supabase-server";
import { getCurrentFirmForSession } from "@/modules/firm/services/get-current-firm";
import { isSubscribed } from "@/modules/billing/services/entitlements";

function todayInKolkata(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
}
function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

const priorityRank: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };

export async function getAttentionNotices(limit = 10) {
  const { user, firm } = await getCurrentFirmForSession();
  if (!user || !firm) return [];
  if (!(await isSubscribed(firm.id, "noticeflow"))) return [];

  const supabase = await createServerSupabaseClient();
  const today = todayInKolkata();
  const in7 = addDays(today, 7);

  const { data, error } = await supabase
    .from("notices")
    .select("id, client_id, reference_number, priority, response_deadline, status, assigned_to")
    .eq("firm_id", firm.id)
    .neq("status", "closed")
    .order("response_deadline", { ascending: true })
    .limit(50);

  if (error) throw new Error(error.message);

  // Enrich client names
  const clientIds = [...new Set((data ?? []).map((n) => n.client_id))];
  let clientsMap = new Map<string, string>();
  if (clientIds.length > 0) {
    const { data: clients } = await supabase.from("clients").select("id, name").in("id", clientIds);
    clientsMap = new Map((clients ?? []).map((c) => [c.id, c.name as string]));
  }

  const enriched = (data ?? []).map((n) => ({
    ...n,
    clientName: clientsMap.get(n.client_id) ?? n.client_id.slice(0, 8),
    overdue: n.response_deadline < today,
    dueSoon: n.response_deadline >= today && n.response_deadline <= in7,
  }));

  enriched.sort((a, b) => {
    if (a.overdue !== b.overdue) return a.overdue ? -1 : 1;
    if (a.dueSoon !== b.dueSoon) return a.dueSoon ? -1 : 1;
    if (a.response_deadline !== b.response_deadline) return a.response_deadline < b.response_deadline ? -1 : 1;
    return (priorityRank[a.priority] ?? 99) - (priorityRank[b.priority] ?? 99);
  });

  return enriched.slice(0, limit);
}
