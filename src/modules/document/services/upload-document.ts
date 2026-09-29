import { createServerSupabaseClient } from "@/infrastructure/database/supabase-server";
import { createServiceSupabaseClient } from "@/infrastructure/database/supabase-service";
import { getCurrentFirmForSession } from "@/modules/firm/services/get-current-firm";
import { getMembershipRole } from "@/modules/firm/permissions/get-membership";
import { requireEntitlement } from "@/modules/billing/services/entitlements";
import { canUploadDocument } from "../permissions/document-permissions";
import { buildStoragePath, sanitizeFilename } from "../schemas/document-schema";
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from "../types/document-types";
import { getNoticeById } from "@/modules/notice/repositories/notice-repository";
import { insertDocument } from "../repositories/document-repository";

const BUCKET = "notice-documents";

export async function uploadDocumentForCurrentFirm(args: {
  noticeId: string;
  file: File;
}): Promise<{ documentId: string } | { error: string }> {
  const { user, firm } = await getCurrentFirmForSession();
  if (!user) return { error: "Not authenticated" };
  if (!firm) return { error: "No firm" };

  try {
    await requireEntitlement(firm.id, "noticeflow");
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Not subscribed";
    return { error: msg };
  }

  const supabase = await createServerSupabaseClient();
  const notice = await getNoticeById(supabase, args.noticeId);
  if (!notice || notice.firm_id !== firm.id) return { error: "Notice not found in your firm" };

  const role = await getMembershipRole(firm.id);
  if (!canUploadDocument(role as never, user.id, notice.assigned_to)) return { error: "Not allowed" };

  const file = args.file;
  if (!ALLOWED_MIME_TYPES.includes(file.type as never)) return { error: "Unsupported file type" };
  if (file.size > MAX_FILE_SIZE) return { error: "File too large (max 10 MB)" };
  if (!file.name || file.name.trim().length === 0) return { error: "Filename required" };

  const safeName = sanitizeFilename(file.name);
  // Validate mime vs extension basic (do not trust mime alone fully, but no paid scan)
  const documentId = crypto.randomUUID();
  const storagePath = buildStoragePath(firm.id, notice.id, documentId, safeName);

  const service = createServiceSupabaseClient();
  const arrayBuffer = await file.arrayBuffer();
  const { error: uploadError } = await service.storage.from(BUCKET).upload(storagePath, arrayBuffer, {
    contentType: file.type,
    upsert: false,
  });
  if (uploadError) return { error: uploadError.message };

  // Insert metadata — if fails, cleanup object
  try {
    await insertDocument(service, {
      id: documentId,
      firm_id: firm.id,
      notice_id: notice.id,
      uploaded_by: user.id,
      file_name: file.name.slice(0, 255),
      storage_path: storagePath,
      mime_type: file.type,
      file_size: file.size,
    });
  } catch (e) {
    await service.storage.from(BUCKET).remove([storagePath]);
    const msg = e instanceof Error ? e.message : "Failed to save document";
    return { error: msg };
  }

  return { documentId };
}
