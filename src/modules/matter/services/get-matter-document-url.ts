import { createServerSupabaseClient } from "@/infrastructure/database/supabase-server";
import { createServiceSupabaseClient } from "@/infrastructure/database/supabase-service";
import { getCurrentFirmForSession } from "@/modules/firm/services/get-current-firm";
import { getMatterDocumentForFirm } from "../repositories/matter-document-repository";
import { getMatterByIdForFirm } from "../repositories/matter-repository";

const BUCKET = "matter-documents";

export async function getMatterDocumentUrlForCurrentFirm(documentId: string) {
  const { firm } = await getCurrentFirmForSession();
  if (!firm) return { error: "Not authenticated" };
  const supabase = await createServerSupabaseClient();
  const doc = await getMatterDocumentForFirm(supabase, documentId, firm.id);
  if (!doc) return { error: "Document not found in your firm" };

  const matter = await getMatterByIdForFirm(supabase, doc.matter_id, firm.id);
  if (!matter) return { error: "Matter not found in your firm" };

  const service = createServiceSupabaseClient();
  const { data, error } = await service.storage.from(BUCKET).createSignedUrl(doc.storage_path, 60);
  if (error || !data?.signedUrl) return { error: error?.message ?? "Failed to create URL" };
  return { url: data.signedUrl };
}
