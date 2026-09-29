import { createServerSupabaseClient } from "@/infrastructure/database/supabase-server";
import { createServiceSupabaseClient } from "@/infrastructure/database/supabase-service";
import { getCurrentFirmForSession } from "@/modules/firm/services/get-current-firm";
import { getMembershipRole } from "@/modules/firm/permissions/get-membership";
import { requireEntitlement } from "@/modules/billing/services/entitlements";
import { canDeleteDocument } from "../permissions/document-permissions";
import { deleteDocumentRow, getDocumentById } from "../repositories/document-repository";

const BUCKET = "notice-documents";

export async function deleteDocumentForCurrentFirm(documentId: string): Promise<{ ok: true } | { error: string }> {
  const { user, firm } = await getCurrentFirmForSession();
  if (!user) return { error: "Not authenticated" };
  if (!firm) return { error: "No firm" };

  try {
    await requireEntitlement(firm.id, "noticeflow");
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Not subscribed";
    return { error: msg };
  }

  const role = await getMembershipRole(firm.id);
  if (!canDeleteDocument(role as never)) return { error: "Not allowed" };

  const supabase = await createServerSupabaseClient();
  const doc = await getDocumentById(supabase, documentId);
  if (!doc || doc.firm_id !== firm.id) return { error: "Document not found in your firm" };

  const service = createServiceSupabaseClient();
  await service.storage.from(BUCKET).remove([doc.storage_path]);
  // Remove metadata via service (bypasses RLS, but authorization already checked)
  await deleteDocumentRow(service, documentId);
  return { ok: true };
}
