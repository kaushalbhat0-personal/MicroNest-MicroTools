import type { SupabaseClient } from "@supabase/supabase-js";
import type { Note } from "../types/note-types";

type DbClient = SupabaseClient;

export async function listNotesByNotice(db: DbClient, noticeId: string): Promise<Note[]> {
  const { data, error } = await db.from("notes").select("*").eq("notice_id", noticeId).order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as Note[];
}

export async function getNoteById(db: DbClient, id: string): Promise<Note | null> {
  const { data, error } = await db.from("notes").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data as Note | null;
}

export async function insertNote(
  db: DbClient,
  row: { firm_id: string; notice_id: string; author_id: string; content: string },
): Promise<Note> {
  const { data, error } = await db.from("notes").insert(row).select("*").single();
  if (error) throw new Error(error.message);
  return data as Note;
}

export async function updateNoteContent(db: DbClient, id: string, content: string): Promise<Note> {
  const { data, error } = await db.from("notes").update({ content }).eq("id", id).select("*").single();
  if (error) throw new Error(error.message);
  return data as Note;
}

export async function deleteNoteRow(db: DbClient, id: string): Promise<void> {
  const { error } = await db.from("notes").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
