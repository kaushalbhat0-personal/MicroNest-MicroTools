import { createServerSupabaseClient } from "@/infrastructure/database/supabase-server";
import { getCurrentFirmForSession } from "@/modules/firm/services/get-current-firm";
import { requireEntitlement } from "@/modules/billing/services/entitlements";

export async function verifyChecklistItemForCurrentFirm(checklistItemId: string) {
  const { user, firm } = await getCurrentFirmForSession();
  if (!user) return { error: "Not authenticated" };
  if (!firm) return { error: "No firm" };
  try {
    await requireEntitlement(firm.id, "mattervault");
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Not subscribed";
    return { error: msg };
  }
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.rpc("verify_checklist_item_and_maybe_ready", {
    p_checklist_item_id: checklistItemId,
  });
  if (error) return { error: error.message };
  return { ok: true };
}

export async function rejectChecklistItemForCurrentFirm(checklistItemId: string) {
  const { user, firm } = await getCurrentFirmForSession();
  if (!user) return { error: "Not authenticated" };
  if (!firm) return { error: "No firm" };
  try {
    await requireEntitlement(firm.id, "mattervault");
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Not subscribed";
    return { error: msg };
  }
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.rpc("reject_checklist_item", {
    p_checklist_item_id: checklistItemId,
  });
  if (error) return { error: error.message };
  return { ok: true };
}
