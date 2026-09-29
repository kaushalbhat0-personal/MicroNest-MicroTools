import { createServerSupabaseClient } from "@/infrastructure/database/supabase-server";
import { createServiceSupabaseClient } from "@/infrastructure/database/supabase-service";
import { getCurrentFirmForSession } from "@/modules/firm/services/get-current-firm";
import { getMembershipRole } from "@/modules/firm/permissions/get-membership";
import { requireEntitlement } from "@/modules/billing/services/entitlements";
import { canEditMatter } from "../permissions/matter-permissions";
import { updateMatterSchema } from "../schemas/matter-schema";
import { getMatterByIdForFirm } from "../repositories/matter-repository";

export async function updateMatterForCurrentFirm(raw: unknown) {
  const parsed = updateMatterSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      error: "Fix validation errors",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }
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
  const existing = await getMatterByIdForFirm(supabase, parsed.data.id, firm.id);
  if (!existing) return { error: "Matter not found in your firm" };

  const role = await getMembershipRole(firm.id);
  if (!canEditMatter(role as never, user.id, existing.assigned_to)) return { error: "Not allowed" };

  // Validate matter_type not changed — prohibit for V1
  // updateMatterSchema does not include matter_type, so this is enforced by schema omission

  const assignedTo = (parsed.data.assigned_to as string | null) || null;
  if (assignedTo) {
    const { data: member } = await supabase
      .from("firm_members")
      .select("id")
      .eq("firm_id", firm.id)
      .eq("user_id", assignedTo)
      .maybeSingle();
    if (!member) return { error: "Assigned user must belong to your firm" };
  }

  const service = createServiceSupabaseClient();
  const { data, error } = await service
    .from("matters")
    .update({
      title: parsed.data.title.trim(),
      assigned_to: assignedTo,
      next_action: parsed.data.next_action?.trim() || null,
      next_action_date: parsed.data.next_action_date?.trim() || null,
      deadline: parsed.data.deadline?.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", existing.id)
    .eq("firm_id", firm.id)
    .select("*")
    .single();
  if (error) return { error: error.message };
  return { matter: data };
}
