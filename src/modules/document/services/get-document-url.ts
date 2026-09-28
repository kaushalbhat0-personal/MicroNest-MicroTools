import { createServerSupabaseClient } from "@/infrastructure/database/supabase-server";
import { createServiceSupabaseClient } from "@/infrastructure/database/supabase-service";
import { getCurrentFirmForSession } from "@/modules/firm/services/get-current-firm";
import { getDocumentById } from "../repositories/document-repository";
import { getNoticeById } from "@/modules/notice/repositories/notice-repository";

const BUCKET = "notice-documents";
const SIGNED_URL_SECONDS = 60;

export async function getDocumentSignedUrlForCurrentFirm(documentId: string): Promise<{ url: string } | { error: string }> {
  const { user, firm } = await getCurrentFirmForSession();
  if (!user) return { error: "Not authenticated" };
  if (!firm) return { error: "No firm" };

  const supabase = await createServerSupabaseClient();
  const doc = await getDocumentById(supabase, documentId);
  if (!doc || doc.firm_id !== firm.id) return { error: "Document not found in your firm" };

  const notice = await getNoticeById(supabase, doc.notice_id);
  if (!notice || notice.firm_id !== firm.id) return { error: "Notice not found" };

  const service = createServiceSupabaseClient();
  const { data, error } = await service.storage.from(BUCKET).createSignedUrl(doc.storage_path, SIGNED_URL_SECONDS);
  if (error || !data?.signedUrl) return { error: error?.message ?? "Failed to create URL" };
  return { url: data.signedUrl };
}
