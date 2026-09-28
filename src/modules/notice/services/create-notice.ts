import { createServerSupabaseClient } from "@/infrastructure/database/supabase-server";
import { getCurrentFirmForSession } from "@/modules/firm/services/get-current-firm";
import { getMembershipRole } from "@/modules/firm/permissions/get-membership";
import { canCreateNotice, canSetAssignedTo } from "../permissions/notice-permissions";
import { createNoticeSchema } from "../schemas/notice-schema";
import { createNoticeRow } from "../repositories/notice-repository";
import { getClientById } from "@/modules/client/repositories/client-repository";

export async function createNoticeForCurrentFirm(raw: unknown) {
  const parsed = createNoticeSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Fix validation errors", fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }
  const { user, firm } = await getCurrentFirmForSession();
  if (!user) return { error: "Not authenticated" };
  if (!firm) return { error: "No firm" };

  const role = await getMembershipRole(firm.id);
  if (!canCreateNotice(role as never)) return { error: "Not allowed" };

  // Assignment permission — MEMBER may only assign to self or null
  const assignedTo = (parsed.data.assigned_to as string | null) || null;
  if (!canSetAssignedTo(role as never, user.id, assignedTo)) return { error: "Not allowed to assign" };

  const supabase = await createServerSupabaseClient();

  // Verify client belongs to same firm
  const client = await getClientById(supabase, parsed.data.client_id);
  if (!client || client.firm_id !== firm.id) return { error: "Client not found in your firm" };

  // Verify assigned_to belongs to firm if supplied
  if (assignedTo) {
    const { data: member } = await supabase.from("firm_members").select("id").eq("firm_id", firm.id).eq("user_id", assignedTo).maybeSingle();
    if (!member) return { error: "Assigned user must belong to your firm" };
  }

  const clean: Record<string, unknown> = {
    client_id: parsed.data.client_id,
    reference_number: parsed.data.reference_number?.trim() || null,
    authority: parsed.data.authority,
    notice_type: parsed.data.notice_type,
    received_date: parsed.data.received_date?.trim() || null,
    response_deadline: parsed.data.response_deadline,
    priority: parsed.data.priority,
    assigned_to: assignedTo,
    next_action: parsed.data.next_action?.trim() || null,
    next_action_date: parsed.data.next_action_date?.trim() || null,
  };

  const notice = await createNoticeRow(supabase, firm.id, clean);
  return { notice };
}
