"use server";

import { revalidatePath } from "next/cache";
import { uploadMatterDocumentForCurrentFirm } from "../services/upload-matter-document";

export async function uploadMatterDocumentAction(formData: FormData) {
  const matterId = String(formData.get("matterId") ?? "");
  const checklistItemId = formData.get("checklistItemId") ? String(formData.get("checklistItemId")) : null;
  const file = formData.get("file") as File | null;
  if (!file) return { error: "File required" };
  const result = await uploadMatterDocumentForCurrentFirm({
    matterId,
    checklistItemId: checklistItemId || null,
    file,
  });
  if ("error" in result && result.error) return { error: result.error };
  revalidatePath(`/app/matters/${matterId}`);
  return { ok: true };
}
