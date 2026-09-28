import type { SupabaseClient } from "@supabase/supabase-js";
import type { Activity } from "../types/activity-types";

type DbClient = SupabaseClient;

export async function listActivitiesByNotice(db: DbClient, noticeId: string): Promise<Activity[]> {
  const { data, error } = await db.from("activity_log").select("*").eq("notice_id", noticeId).order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as Activity[];
}
