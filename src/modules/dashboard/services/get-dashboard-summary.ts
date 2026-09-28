import { createServerSupabaseClient } from "@/infrastructure/database/supabase-server";
import { getCurrentFirmForSession } from "@/modules/firm/services/get-current-firm";

function todayInKolkata(): string {
  // en-CA gives YYYY-MM-DD
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export async function getDashboardSummary() {
  const { user, firm } = await getCurrentFirmForSession();
  if (!user || !firm) return { open: 0, overdue: 0, dueSoon: 0, myNotices: 0 };

  const supabase = await createServerSupabaseClient();
  const today = todayInKolkata();
  const in7 = addDays(today, 7);

  const { data, error } = await supabase.from("notices").select("id, status, response_deadline, assigned_to").eq("firm_id", firm.id);
  if (error) throw new Error(error.message);

  const open = (data ?? []).filter((n) => n.status !== "closed");
  const overdue = open.filter((n) => n.response_deadline < today);
  const dueSoon = open.filter((n) => n.response_deadline >= today && n.response_deadline <= in7);
  const myNotices = open.filter((n) => n.assigned_to === user.id);

  return { open: open.length, overdue: overdue.length, dueSoon: dueSoon.length, myNotices: myNotices.length };
}
