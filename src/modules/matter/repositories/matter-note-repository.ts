import type { SupabaseClient } from "@supabase/supabase-js";
import type { MatterNote } from "../types/matter-note-types";

type DbClient = SupabaseClient;

export async function listNotesByMatter(db: DbClient, matterId: string): Promise<MatterNote[]> {
  const { data, error } = await db
    .from("matter_notes")
    .select("*")
    .eq("matter_id", matterId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as MatterNote[];
}

export async function getMatterNoteById(db: DbClient, id: string): Promise<MatterNote | null> {
  const { data, error } = await db.from("matter_notes").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data as MatterNote | null;
}

export async function insertMatterNote(
  db: DbClient,
  row: { firm_id: string; matter_id: string; author_id: string; content: string },
): Promise<MatterNote> {
  const { data, error } = await db.from("matter_notes").insert(row).select("*").single();
  if (error) throw new Error(error.message);
  return data as MatterNote;
}

export async function updateMatterNoteContent(
  db: DbClient,
  id: string,
  content: string,
): Promise<MatterNote> {
  const { data, error } = await db.from("matter_notes").update({ content }).eq("id", id).select("*").single();
  if (error) throw new Error(error.message);
  return data as MatterNote;
}

export async function deleteMatterNote(db: DbClient, id: string): Promise<void> {
  const { error } = await db.from("matter_notes").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
