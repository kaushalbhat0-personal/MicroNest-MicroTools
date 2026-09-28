import { createServerSupabaseClient } from "@/infrastructure/database/supabase-server";
import { getCurrentFirmForSession } from "@/modules/firm/services/get-current-firm";
import { getMatterByIdForFirm } from "../repositories/matter-repository";

export async function getMatterForCurrentFirm(matterId: string) {
  const { firm } = await getCurrentFirmForSession();
  if (!firm) return null;
  const supabase = await createServerSupabaseClient();
  const matter = await getMatterByIdForFirm(supabase, matterId, firm.id);
  return matter;
}
