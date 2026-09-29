import { createServerSupabaseClient } from "@/infrastructure/database/supabase-server";
import { createServiceSupabaseClient } from "@/infrastructure/database/supabase-service";
import { getCurrentFirmForSession } from "@/modules/firm/services/get-current-firm";
import { getMembershipRole } from "@/modules/firm/permissions/get-membership";
import { requireEntitlement } from "@/modules/billing/services/entitlements";
import { canUploadToMatter } from "../permissions/matter-permissions";
import { buildMatterStoragePath, sanitizeFilename } from "../schemas/matter-document-schema";
import { MATTER_ALLOWED_MIME_TYPES, MATTER_MAX_FILE_SIZE } from "../types/matter-document-types";
import { getMatterByIdForFirm } from "../repositories/matter-repository";

const BUCKET = "matter-documents";

export async function uploadMatterDocumentForCurrentFirm(args: {
  matterId: string;
  checklistItemId?: string | null;
  file: File;
}): Promise<{ documentId: string } | { error: string }> {
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
  const matter = await getMatterByIdForFirm(supabase, args.matterId, firm.id);
  if (!matter) return { error: "Matter not found in your firm" };

  const role = await getMembershipRole(firm.id);
  if (!canUploadToMatter(role as never, user.id, matter.assigned_to)) return { error: "Not allowed" };

  const file = args.file;
  if (!MATTER_ALLOWED_MIME_TYPES.includes(file.type as never)) return { error: "Unsupported file type" };
  if (file.size > MATTER_MAX_FILE_SIZE) return { error: "File too large (max 10 MB)" };
  if (!file.name || file.name.trim().length === 0) return { error: "Filename required" };

  // Optional checklist linkage validation
  let checklistItem: { id: string; matter_id: string } | null = null;
  if (args.checklistItemId) {
    const { data } = await supabase
      .from("checklist_items")
      .select("id, matter_id")
      .eq("id", args.checklistItemId)
      .eq("firm_id", firm.id)
      .maybeSingle();
    if (!data) return { error: "Checklist item not found in your firm" };
    if (data.matter_id !== matter.id) return { error: "Checklist does not belong to matter" };
    checklistItem = data;
  }

  const safeName = sanitizeFilename(file.name);
  const documentId = crypto.randomUUID();
  const storagePath = buildMatterStoragePath(firm.id, matter.id, documentId, safeName);

  const service = createServiceSupabaseClient();
  const arrayBuffer = await file.arrayBuffer();
  const { error: uploadError } = await service.storage.from(BUCKET).upload(storagePath, arrayBuffer, {
    contentType: file.type,
    upsert: false,
  });
  if (uploadError) return { error: uploadError.message };

  try {
    const { error: insertError } = await service.from("matter_documents").insert({
      id: documentId,
      firm_id: firm.id,
      matter_id: matter.id,
      uploaded_by: user.id,
      file_name: file.name.slice(0, 255),
      storage_path: storagePath,
      mime_type: file.type,
      file_size: file.size,
    });
    if (insertError) throw new Error(insertError.message);

    // Link to checklist if provided → status uploaded
    if (checklistItem) {
      const { error: linkErr } = await service
        .from("checklist_items")
        .update({ document_id: documentId, status: "uploaded" })
        .eq("id", checklistItem.id);
      if (linkErr) throw new Error(linkErr.message);
    }

    // Activity
    await service.from("matter_activity").insert({
      firm_id: firm.id,
      matter_id: matter.id,
      actor_id: user.id,
      action: "document_uploaded",
      metadata: { document_id: documentId, checklist_item_id: checklistItem?.id ?? null },
    });
  } catch (e) {
    await service.storage.from(BUCKET).remove([storagePath]);
    const msg = e instanceof Error ? e.message : "Failed to save document";
    return { error: msg };
  }

  return { documentId };
}
