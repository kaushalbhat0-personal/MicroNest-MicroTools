import type { SupabaseClient } from "@supabase/supabase-js";
import type { Document } from "../types/document-types";

type DbClient = SupabaseClient;

export async function listDocumentsByNotice(db: DbClient, noticeId: string): Promise<Document[]> {
  const { data, error } = await db.from("documents").select("*").eq("notice_id", noticeId).order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as Document[];
}

export async function getDocumentById(db: DbClient, id: string): Promise<Document | null> {
  const { data, error } = await db.from("documents").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data as Document | null;
}

export async function insertDocument(db: DbClient, row: Omit<Document, "created_at" | "updated_at">): Promise<Document> {
  const { data, error } = await db.from("documents").insert(row).select("*").single();
  if (error) throw new Error(error.message);
  return data as Document;
}

export async function deleteDocumentRow(db: DbClient, id: string): Promise<void> {
  const { error } = await db.from("documents").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
