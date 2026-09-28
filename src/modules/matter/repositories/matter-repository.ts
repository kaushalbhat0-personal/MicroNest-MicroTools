import type { SupabaseClient } from "@supabase/supabase-js";
import type { Matter } from "../types/matter-types";

type DbClient = SupabaseClient;

export async function listMattersByFirm(db: DbClient, firmId: string): Promise<Matter[]> {
  const { data, error } = await db
    .from("matters")
    .select("*")
    .eq("firm_id", firmId)
    .order("deadline", { ascending: true, nullsFirst: false })
    .order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Matter[];
}

export async function getMatterById(db: DbClient, id: string): Promise<Matter | null> {
  const { data, error } = await db.from("matters").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data as Matter | null;
}

export async function getMatterByIdForFirm(db: DbClient, id: string, firmId: string): Promise<Matter | null> {
  const { data, error } = await db.from("matters").select("*").eq("id", id).eq("firm_id", firmId).maybeSingle();
  if (error) throw new Error(error.message);
  return data as Matter | null;
}

export async function createMatterRow(
  db: DbClient,
  firmId: string,
  input: Record<string, unknown>,
): Promise<Matter> {
  const { data, error } = await db
    .from("matters")
    .insert({ firm_id: firmId, ...input })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as Matter;
}

export async function updateMatterRow(db: DbClient, id: string, input: Record<string, unknown>): Promise<Matter> {
  const { data, error } = await db.from("matters").update(input).eq("id", id).select("*").single();
  if (error) throw new Error(error.message);
  return data as Matter;
}
