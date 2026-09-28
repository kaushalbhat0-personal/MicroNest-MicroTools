import { createServerSupabaseClient } from "@/infrastructure/database/supabase-server";
import { getCurrentFirmForSession } from "@/modules/firm/services/get-current-firm";
import { listClientsByFirm } from "../repositories/client-repository";

export async function listClientsForCurrentFirm(includeArchived = false) {
  const { user, firm } = await getCurrentFirmForSession();
  if (!user) throw new Error("Not authenticated");
  if (!firm) throw new Error("No firm");
  const supabase = await createServerSupabaseClient();
  return listClientsByFirm(supabase, firm.id, includeArchived);
}
