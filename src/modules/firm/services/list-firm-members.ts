import { createServerSupabaseClient } from "@/infrastructure/database/supabase-server";
import { getCurrentFirmForSession } from "./get-current-firm";
import { listMembersByFirm } from "../repositories/firm-repository";

/**
 * Lists members for the caller's active firm.
 * Derives firm from session — never client firm_id.
 */
export async function listMembersForCurrentFirm() {
  const { user, firm } = await getCurrentFirmForSession();
  if (!user) throw new Error("Not authenticated");
  if (!firm) throw new Error("No firm");
  const supabase = await createServerSupabaseClient();
  const members = await listMembersByFirm(supabase, firm.id);
  // Enrich with user email/name via join is future; Phase 1B returns members only
  return { firm, members };
}
