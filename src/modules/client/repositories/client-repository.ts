import type { SupabaseClient } from "@supabase/supabase-js";
import type { Client } from "../types/client-types";

type DbClient = SupabaseClient;

export async function listClientsByFirm(db: DbClient, firmId: string, includeArchived = false): Promise<Client[]> {
  let q = db.from("clients").select("*").eq("firm_id", firmId).order("name");
  if (!includeArchived) q = q.eq("is_archived", false);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []) as Client[];
}

export async function getClientById(db: DbClient, id: string): Promise<Client | null> {
  const { data, error } = await db.from("clients").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data as Client | null;
}

export async function createClientRow(
  db: DbClient,
  firmId: string,
  input: { name: string; email?: string | null; phone?: string | null; address?: Record<string, unknown> | null },
): Promise<Client> {
  const { data, error } = await db
    .from("clients")
    .insert({
      firm_id: firmId,
      name: input.name,
      email: input.email ?? null,
      phone: input.phone ?? null,
      address: input.address ?? null,
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as Client;
}

export async function updateClientRow(
  db: DbClient,
  id: string,
  input: { name: string; email?: string | null; phone?: string | null; address?: Record<string, unknown> | null },
): Promise<Client> {
  const { data, error } = await db.from("clients").update(input).eq("id", id).select("*").single();
  if (error) throw new Error(error.message);
  return data as Client;
}

export async function setClientArchived(db: DbClient, id: string, isArchived: boolean): Promise<void> {
  const { error } = await db.from("clients").update({ is_archived: isArchived }).eq("id", id);
  if (error) throw new Error(error.message);
}
