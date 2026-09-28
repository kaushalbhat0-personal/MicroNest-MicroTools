import type { SupabaseClient } from "@supabase/supabase-js";
import type { Firm, FirmMember } from "../types/firm-types";

type DbClient = SupabaseClient;

export async function getFirmsForUser(db: DbClient, userId: string): Promise<Firm[]> {
  const { data, error } = await db
    .from("firm_members")
    .select("firms!inner(*)")
    .eq("user_id", userId);
  if (error) throw error;
  return (data as unknown as { firms: Firm }[]).map((r) => r.firms);
}

export async function getFirmById(db: DbClient, firmId: string): Promise<Firm | null> {
  const { data, error } = await db.from("firms").select("*").eq("id", firmId).maybeSingle();
  if (error) throw error;
  return data as Firm | null;
}

export async function getMembership(db: DbClient, firmId: string, userId: string): Promise<FirmMember | null> {
  const { data, error } = await db
    .from("firm_members")
    .select("*")
    .eq("firm_id", firmId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data as FirmMember | null;
}

export async function listMembersByFirm(db: DbClient, firmId: string): Promise<FirmMember[]> {
  const { data, error } = await db.from("firm_members").select("*").eq("firm_id", firmId);
  if (error) throw error;
  return (data ?? []) as FirmMember[];
}

export async function createFirmAtomicViaRpc(db: DbClient, name: string): Promise<string> {
  const { data, error } = await db.rpc("create_firm_for_current_user", { p_name: name });
  if (error) throw new Error(error.message);
  return data as string;
}

export async function updateMemberRole(db: DbClient, memberId: string, newRole: string): Promise<void> {
  const { error } = await db.from("firm_members").update({ role: newRole }).eq("id", memberId);
  if (error) throw new Error(error.message);
}
