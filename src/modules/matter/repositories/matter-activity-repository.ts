import type { SupabaseClient } from "@supabase/supabase-js";
import type { MatterActivity } from "../types/matter-activity-types";

type DbClient = SupabaseClient;

export async function listActivitiesByMatter(db: DbClient, matterId: string): Promise<MatterActivity[]> {
  const { data, error } = await db
    .from("matter_activity")
    .select("*")
    .eq("matter_id", matterId)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as MatterActivity[];
}

export async function insertMatterActivity(
  db: DbClient,
  row: {
    firm_id: string;
    matter_id: string;
    actor_id: string;
    action: string;
    from_status?: string | null;
    to_status?: string | null;
    metadata?: Record<string, unknown> | null;
  },
): Promise<MatterActivity> {
  const { data, error } = await db.from("matter_activity").insert(row).select("*").single();
  if (error) throw new Error(error.message);
  return data as MatterActivity;
}
