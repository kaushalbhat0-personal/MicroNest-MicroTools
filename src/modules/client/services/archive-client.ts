import { createServerSupabaseClient } from "@/infrastructure/database/supabase-server";
import { getCurrentFirmForSession } from "@/modules/firm/services/get-current-firm";
import { archiveClientSchema } from "../schemas/client-schema";
import { canMutateClients } from "../permissions/client-permissions";
import { getMembershipRole } from "@/modules/firm/permissions/get-membership";
import { getClientById, setClientArchived } from "../repositories/client-repository";

export async function archiveClientForCurrentFirm(raw: unknown) {
  const parsed = archiveClientSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Fix validation errors", fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }
  const { user, firm } = await getCurrentFirmForSession();
  if (!user) return { error: "Not authenticated" };
  if (!firm) return { error: "No firm" };

  const role = await getMembershipRole(firm.id);
  if (!canMutateClients(role as never)) return { error: "Not allowed" };

  const supabase = await createServerSupabaseClient();
  const existing = await getClientById(supabase, parsed.data.id);
  if (!existing || existing.firm_id !== firm.id) return { error: "Client not found in your firm" };

  await setClientArchived(supabase, parsed.data.id, parsed.data.is_archived);
  return { ok: true };
}
