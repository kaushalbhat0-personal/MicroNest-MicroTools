import { createServerSupabaseClient } from "@/infrastructure/database/supabase-server";
import { getCurrentFirmForSession } from "@/modules/firm/services/get-current-firm";
import type { Notice } from "../types/notice-types";
import type { NoticeFilterInput } from "../schemas/notice-filter-schema";

function todayInKolkata(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
}
function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

const PAGE_SIZE = 20;

export async function listNoticesFiltered(filters: NoticeFilterInput): Promise<Notice[]> {
  // Complete filtered set — for CSV export and non-paginated consumers
  const { user, firm } = await getCurrentFirmForSession();
  if (!user || !firm) return [];
  const supabase = await createServerSupabaseClient();
  let query = supabase.from("notices").select("*").eq("firm_id", firm.id);
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.priority) query = query.eq("priority", filters.priority);
  if (filters.authority) query = query.eq("authority", filters.authority);
  if (filters.assigned) {
    if (filters.assigned === "my") query = query.eq("assigned_to", user.id);
    else if (filters.assigned === "unassigned") query = query.is("assigned_to", null);
    else if (/^[0-9a-f-]{36}$/i.test(filters.assigned)) query = query.eq("assigned_to", filters.assigned);
  }
  if (filters.deadline && filters.deadline !== "all") {
    const today = todayInKolkata();
    if (filters.deadline === "overdue") query = query.lt("response_deadline", today);
    else if (filters.deadline === "today") query = query.eq("response_deadline", today);
    else if (filters.deadline === "due_7") {
      const in7 = addDays(today, 7);
      query = query.gte("response_deadline", today).lte("response_deadline", in7);
    }
  }
  const { data, error } = await query.order("response_deadline", { ascending: true });
  if (error) throw new Error(error.message);
  let notices = (data ?? []) as Notice[];
  if (filters.q && filters.q.trim().length > 0) {
    const q = filters.q.trim().toLowerCase();
    const { data: clients } = await supabase.from("clients").select("id, name").eq("firm_id", firm.id).ilike("name", `%${q}%`);
    const matched = new Set((clients ?? []).map((c) => c.id as string));
    notices = notices.filter((n) => n.reference_number?.toLowerCase().includes(q) || matched.has(n.client_id));
  }
  return notices;
}

export async function listNoticesFilteredPaginated(
  filters: NoticeFilterInput & { page?: number },
): Promise<{ notices: Notice[]; total: number; page: number; pageSize: number; totalPages: number }> {
  const { user, firm } = await getCurrentFirmForSession();
  if (!user || !firm) return { notices: [], total: 0, page: 1, pageSize: PAGE_SIZE, totalPages: 0 };

  const supabase = await createServerSupabaseClient();
  const page = filters.page && filters.page >= 1 ? filters.page : 1;

  let query = supabase.from("notices").select("*", { count: "exact" }).eq("firm_id", firm.id);

  if (filters.status) query = query.eq("status", filters.status);
  if (filters.priority) query = query.eq("priority", filters.priority);
  if (filters.authority) query = query.eq("authority", filters.authority);

  if (filters.assigned) {
    if (filters.assigned === "my") query = query.eq("assigned_to", user.id);
    else if (filters.assigned === "unassigned") query = query.is("assigned_to", null);
    else if (/^[0-9a-f-]{36}$/i.test(filters.assigned)) query = query.eq("assigned_to", filters.assigned);
  }

  if (filters.deadline && filters.deadline !== "all") {
    const today = todayInKolkata();
    if (filters.deadline === "overdue") query = query.lt("response_deadline", today);
    else if (filters.deadline === "today") query = query.eq("response_deadline", today);
    else if (filters.deadline === "due_7") {
      const in7 = addDays(today, 7);
      query = query.gte("response_deadline", today).lte("response_deadline", in7);
    }
  }

  const hasQ = filters.q && filters.q.trim().length > 0;

  if (hasQ) {
    const qRaw = filters.q!.trim();
    // Escape % and _ for ilike? Keep simple for V1 — use raw q with % wildcards
    const qPattern = `%${qRaw}%`;
    const { data: clients } = await supabase.from("clients").select("id").eq("firm_id", firm.id).ilike("name", qPattern);
    const matchedIds = (clients ?? []).map((c) => c.id as string);

    // Database-side OR: reference_number ilike OR client_id in matched
    if (matchedIds.length > 0) {
      const idsList = matchedIds.join(",");
      query = query.or(`reference_number.ilike.${qPattern},client_id.in.(${idsList})`);
    } else {
      query = query.ilike("reference_number", qPattern);
    }

    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    const { data, error, count } = await query.order("response_deadline", { ascending: true }).range(from, to);
    if (error) throw new Error(error.message);
    const notices = (data ?? []) as Notice[];
    const total = count ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    return { notices, total, page: Math.min(page, totalPages), pageSize: PAGE_SIZE, totalPages };
  }

  // Non-q path: server-side pagination via range
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const { data, error, count } = await query.order("response_deadline", { ascending: true }).range(from, to);
  if (error) throw new Error(error.message);
  const notices = (data ?? []) as Notice[];
  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  return { notices, total, page: Math.min(page, totalPages), pageSize: PAGE_SIZE, totalPages };
}
