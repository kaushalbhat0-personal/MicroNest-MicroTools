import { createServerSupabaseClient } from "@/infrastructure/database/supabase-server";
import { getCurrentFirmForSession } from "@/modules/firm/services/get-current-firm";
import { getMembershipRole } from "@/modules/firm/permissions/get-membership";
import { canEditNotice, canSetAssignedTo } from "../permissions/notice-permissions";
import { updateNoticeSchema } from "../schemas/notice-schema";
import { getNoticeById, updateNoticeRow } from "../repositories/notice-repository";
import { getClientById } from "@/modules/client/repositories/client-repository";
import { requireEntitlement } from "@/modules/billing/services/entitlements";

export async function updateNoticeForCurrentFirm(raw: unknown) {
  const parsed = updateNoticeSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Fix validation errors", fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }
  const { user, firm } = await getCurrentFirmForSession();
  if (!user) return { error: "Not authenticated" };
  if (!firm) return { error: "No firm" };

  await requireEntitlement(firm.id, "noticeflow");

  const supabase = await createServerSupabaseClient();

  const existing = await getNoticeById(supabase, parsed.data.id);
  if (!existing || existing.firm_id !== firm.id) return { error: "Notice not found in your firm" };

  const role = await getMembershipRole(firm.id);
  if (!canEditNotice(role as never, user.id, existing.assigned_to)) return { error: "Not allowed" };

  const assignedTo = (parsed.data.assigned_to as string | null) || null;
  if (!canSetAssignedTo(role as never, user.id, assignedTo)) return { error: "Not allowed to assign" };

  // Verify client still same firm
  const client = await getClientById(supabase, parsed.data.client_id);
  if (!client || client.firm_id !== firm.id) return { error: "Client not found in your firm" };

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

  const notice = await updateNoticeRow(supabase, parsed.data.id, clean);
  return { notice };
}
