import { createServerSupabaseClient } from "@/infrastructure/database/supabase-server";
import type { FirmRole } from "../constants/firm-constants";

/**
 * Returns the caller's membership role for a firm, derived server-side.
 * Never trusts client-provided role.
 */
export async function getMembershipRole(firmId: string): Promise<FirmRole | null> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("firm_members")
    .select("role")
    .eq("firm_id", firmId)
    .eq("user_id", user.id)
    .maybeSingle();
  return (data?.role as FirmRole | undefined) ?? null;
}
