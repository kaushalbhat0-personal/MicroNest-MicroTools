import type { SupabaseClient } from "@supabase/supabase-js";
import type { MatterDocument } from "../types/matter-document-types";

type DbClient = SupabaseClient;

export async function listDocumentsByMatter(db: DbClient, matterId: string): Promise<MatterDocument[]> {
  const { data, error } = await db
    .from("matter_documents")
    .select("*")
    .eq("matter_id", matterId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as MatterDocument[];
}

export async function getMatterDocumentById(db: DbClient, id: string): Promise<MatterDocument | null> {
  const { data, error } = await db.from("matter_documents").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data as MatterDocument | null;
}

export async function getMatterDocumentForFirm(
  db: DbClient,
  id: string,
  firmId: string,
): Promise<MatterDocument | null> {
  const { data, error } = await db
    .from("matter_documents")
    .select("*")
    .eq("id", id)
    .eq("firm_id", firmId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as MatterDocument | null;
}

export async function insertMatterDocument(
  db: DbClient,
  row: {
    id: string;
    firm_id: string;
    matter_id: string;
    uploaded_by: string;
    file_name: string;
    storage_path: string;
    mime_type: string;
    file_size: number;
  },
): Promise<MatterDocument> {
  const { data, error } = await db.from("matter_documents").insert(row).select("*").single();
  if (error) throw new Error(error.message);
  return data as MatterDocument;
}

export async function deleteMatterDocument(db: DbClient, id: string): Promise<void> {
  const { error } = await db.from("matter_documents").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
