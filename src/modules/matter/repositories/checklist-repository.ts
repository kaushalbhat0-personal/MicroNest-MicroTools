import type { SupabaseClient } from "@supabase/supabase-js";
import type { ChecklistItem } from "../types/checklist-types";

type DbClient = SupabaseClient;

export async function listChecklistByMatter(db: DbClient, matterId: string): Promise<ChecklistItem[]> {
  const { data, error } = await db
    .from("checklist_items")
    .select("*")
    .eq("matter_id", matterId)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as ChecklistItem[];
}

export async function getChecklistItemById(db: DbClient, id: string): Promise<ChecklistItem | null> {
  const { data, error } = await db.from("checklist_items").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data as ChecklistItem | null;
}

export async function getChecklistItemForFirm(
  db: DbClient,
  id: string,
  firmId: string,
): Promise<ChecklistItem | null> {
  const { data, error } = await db
    .from("checklist_items")
    .select("*")
    .eq("id", id)
    .eq("firm_id", firmId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as ChecklistItem | null;
}

export async function createChecklistItems(
  db: DbClient,
  firmId: string,
  matterId: string,
  items: { label: string; required: boolean }[],
): Promise<ChecklistItem[]> {
  const rows = items.map((i) => ({
    matter_id: matterId,
    firm_id: firmId,
    label: i.label,
    required: i.required,
    status: "pending",
  }));
  const { data, error } = await db.from("checklist_items").insert(rows).select("*");
  if (error) throw new Error(error.message);
  return (data ?? []) as ChecklistItem[];
}

export async function updateChecklistItem(
  db: DbClient,
  id: string,
  patch: Partial<ChecklistItem>,
): Promise<ChecklistItem> {
  const { data, error } = await db.from("checklist_items").update(patch).eq("id", id).select("*").single();
  if (error) throw new Error(error.message);
  return data as ChecklistItem;
}
