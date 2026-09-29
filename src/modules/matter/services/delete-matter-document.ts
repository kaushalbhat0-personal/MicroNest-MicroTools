import { createServerSupabaseClient } from "@/infrastructure/database/supabase-server";
import { createServiceSupabaseClient } from "@/infrastructure/database/supabase-service";
import { getCurrentFirmForSession } from "@/modules/firm/services/get-current-firm";
import { getMembershipRole } from "@/modules/firm/permissions/get-membership";
import { requireEntitlement } from "@/modules/billing/services/entitlements";
import { getMatterDocumentForFirm } from "../repositories/matter-document-repository";
import { getMatterByIdForFirm } from "../repositories/matter-repository";

const BUCKET = "matter-documents";

export async function deleteMatterDocumentForCurrentFirm(documentId: string) {
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
  const doc = await getMatterDocumentForFirm(supabase, documentId, firm.id);
  if (!doc) return { error: "Document not found in your firm" };
  const matter = await getMatterByIdForFirm(supabase, doc.matter_id, firm.id);
  if (!matter) return { error: "Matter not found" };
  const role = await getMembershipRole(firm.id);
  // MEMBER can only delete if assigned and is uploader? For V1, owner/admin only delete; member only own upload on assigned matter
  if (role === "member") {
    if (matter.assigned_to !== user.id || doc.uploaded_by !== user.id) {
      return { error: "Not allowed" };
    }
  } else if (role !== "owner" && role !== "admin") {
    return { error: "Not allowed" };
  }
  const service = createServiceSupabaseClient();
  await service.from("matter_documents").delete().eq("id", doc.id);
  await service.storage.from(BUCKET).remove([doc.storage_path]);
  // If checklist linked, reset to pending? Keep rejected logic: unlink and set pending if was uploaded
  await service
    .from("checklist_items")
    .update({ document_id: null, status: "pending" })
    .eq("document_id", doc.id);

  return { ok: true };
}
