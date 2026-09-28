import type { SupabaseClient } from "@supabase/supabase-js";
import type { Notice } from "../types/notice-types";

type DbClient = SupabaseClient;

export async function listNoticesByFirm(db: DbClient, firmId: string): Promise<Notice[]> {
  const { data, error } = await db.from("notices").select("*").eq("firm_id", firmId).order("response_deadline", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as Notice[];
}

export async function getNoticeById(db: DbClient, id: string): Promise<Notice | null> {
  const { data, error } = await db.from("notices").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data as Notice | null;
}

export async function createNoticeRow(db: DbClient, firmId: string, input: Record<string, unknown>): Promise<Notice> {
  const { data, error } = await db
    .from("notices")
    .insert({ firm_id: firmId, ...input, status: "received" })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as Notice;
}

export async function updateNoticeRow(db: DbClient, id: string, input: Record<string, unknown>): Promise<Notice> {
  const { data, error } = await db.from("notices").update(input).eq("id", id).select("*").single();
  if (error) throw new Error(error.message);
  return data as Notice;
}
