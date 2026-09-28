import { createServerSupabaseClient } from "@/infrastructure/database/supabase-server";
import { getCurrentFirmForSession } from "@/modules/firm/services/get-current-firm";

function todayInKolkata(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
}

export async function getMatterDashboardSummary() {
  const { user, firm } = await getCurrentFirmForSession();
  if (!user || !firm) return { openMatters: 0, readyMatters: 0, awaitingDocuments: 0, overdueMatters: 0 };

  const supabase = await createServerSupabaseClient();
  const today = todayInKolkata();

  const { data: matters, error } = await supabase
    .from("matters")
    .select("id, status, deadline")
    .eq("firm_id", firm.id);
  if (error) throw new Error(error.message);

  const openMatters = (matters ?? []).filter((m) => m.status === "open").length;
  const readyMatters = (matters ?? []).filter((m) => m.status === "ready").length;
  const overdueMatters = (matters ?? []).filter(
    (m) => m.status !== "archived" && m.deadline && m.deadline < today,
  ).length;

  // awaiting documents: count matters where any required checklist_item is not verified
  let awaitingDocuments = 0;
  if (matters && matters.length > 0) {
    const ids = matters.filter((m) => m.status === "open").map((m) => m.id);
    if (ids.length > 0) {
      const { data: pending } = await supabase
        .from("checklist_items")
        .select("matter_id")
        .in("matter_id", ids)
        .eq("required", true)
        .neq("status", "verified");
      const set = new Set((pending ?? []).map((p) => p.matter_id));
      awaitingDocuments = set.size;
    }
  }

  return { openMatters, readyMatters, awaitingDocuments, overdueMatters };
}
