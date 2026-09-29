import { createServerSupabaseClient } from "@/infrastructure/database/supabase-server";
import { getCurrentFirmForSession } from "@/modules/firm/services/get-current-firm";
import { requireEntitlement } from "@/modules/billing/services/entitlements";
import { listMattersByFirm } from "../repositories/matter-repository";

import type { MatterStatus } from "../constants/matter-constants";

export async function listMattersForCurrentFirm(status?: MatterStatus) {
  const { firm } = await getCurrentFirmForSession();
  if (!firm) return [];
  await requireEntitlement(firm.id, "mattervault");
  const supabase = await createServerSupabaseClient();
  const matters = await listMattersByFirm(supabase, firm.id);
  if (status) return matters.filter((m) => m.status === status);
  return matters;
}
