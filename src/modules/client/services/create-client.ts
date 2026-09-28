import { createServerSupabaseClient } from "@/infrastructure/database/supabase-server";
import { getCurrentFirmForSession } from "@/modules/firm/services/get-current-firm";
import { createClientSchema } from "../schemas/client-schema";
import { canMutateClients } from "../permissions/client-permissions";
import { getMembershipRole } from "@/modules/firm/permissions/get-membership";
import { createClientRow } from "../repositories/client-repository";

export async function createClientForCurrentFirm(raw: unknown) {
  const parsed = createClientSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Fix validation errors", fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }
  const { user, firm } = await getCurrentFirmForSession();
  if (!user) return { error: "Not authenticated" };
  if (!firm) return { error: "No firm" };

  const role = await getMembershipRole(firm.id);
  if (!canMutateClients(role as never)) return { error: "Not allowed" };

  const supabase = await createServerSupabaseClient();
  const clean = {
    name: parsed.data.name.trim(),
    email: parsed.data.email?.trim() || null,
    phone: parsed.data.phone?.trim() || null,
    address: parsed.data.address ?? null,
  };
  // Derive firm_id from session — never client-supplied
  const client = await createClientRow(supabase, firm.id, clean);
  return { client };
}
