import { createServerSupabaseClient } from "@/infrastructure/database/supabase-server";
import { createServiceSupabaseClient } from "@/infrastructure/database/supabase-service";
import { getCurrentFirmForSession } from "@/modules/firm/services/get-current-firm";
import { getMembershipRole } from "@/modules/firm/permissions/get-membership";
import { canCreateMatter } from "../permissions/matter-permissions";
import { createMatterSchema } from "../schemas/matter-schema";
import { getClientById } from "@/modules/client/repositories/client-repository";
import { getChecklistTemplate } from "../constants/checklist-templates";
import type { MatterType } from "../constants/matter-constants";

export async function createMatterForCurrentFirm(raw: unknown) {
  const parsed = createMatterSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      error: "Fix validation errors",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }
  const { user, firm } = await getCurrentFirmForSession();
  if (!user) return { error: "Not authenticated" };
  if (!firm) return { error: "No firm" };

  const role = await getMembershipRole(firm.id);
  if (!canCreateMatter(role as never)) return { error: "Not allowed" };

  const supabase = await createServerSupabaseClient();

  // Validate client belongs to firm
  const client = await getClientById(supabase, parsed.data.client_id);
  if (!client || client.firm_id !== firm.id) return { error: "Client not found in your firm" };

  // Validate assigned_to belongs to firm if provided
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

  const title = parsed.data.title.trim();
  const matterType = parsed.data.matter_type as MatterType;
  const clean: Record<string, unknown> = {
    client_id: parsed.data.client_id,
    title,
    matter_type: matterType,
    assigned_to: assignedTo,
    next_action: parsed.data.next_action?.trim() || null,
    next_action_date: parsed.data.next_action_date?.trim() || null,
    deadline: parsed.data.deadline?.trim() || null,
    status: "open",
  };

  // Create matter
  const { data: matter, error: matterError } = await service
    .from("matters")
    .insert({ firm_id: firm.id, ...clean })
    .select("*")
    .single();
  if (matterError || !matter) {
    return { error: matterError?.message ?? "Failed to create matter" };
  }

  // Generate checklist — if fails, cleanup matter to avoid partial state
  const template = getChecklistTemplate(matterType);
  const checklistRows = template.map((t) => ({
    matter_id: matter.id,
    firm_id: firm.id,
    label: t.label,
    required: t.required,
    status: "pending" as const,
  }));
  const { error: checklistError } = await service.from("checklist_items").insert(checklistRows);
  if (checklistError) {
    await service.from("matters").delete().eq("id", matter.id);
    return { error: checklistError.message };
  }

  // Activity: matter_created + checklist_issued
  await service.from("matter_activity").insert([
    {
      firm_id: firm.id,
      matter_id: matter.id,
      actor_id: user.id,
      action: "matter_created",
      metadata: { title, matter_type: matterType },
    },
    {
      firm_id: firm.id,
      matter_id: matter.id,
      actor_id: user.id,
      action: "checklist_issued",
      metadata: { count: template.length },
    },
  ]);

  return { matter };
}
