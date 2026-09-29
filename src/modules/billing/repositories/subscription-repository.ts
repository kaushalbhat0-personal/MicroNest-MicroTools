import type { SupabaseClient } from "@supabase/supabase-js";
import type { FirmSubscription } from "../types/subscription-types";

type DbClient = SupabaseClient;

export async function listSubscriptionsByFirm(db: DbClient, firmId: string): Promise<FirmSubscription[]> {
  const { data, error } = await db.from("firm_subscriptions").select("*").eq("firm_id", firmId);
  if (error) throw new Error(error.message);
  return (data ?? []) as FirmSubscription[];
}

export async function getSubscription(db: DbClient, firmId: string, product: string): Promise<FirmSubscription | null> {
  const { data, error } = await db
    .from("firm_subscriptions")
    .select("*")
    .eq("firm_id", firmId)
    .eq("product", product)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as FirmSubscription | null;
}
