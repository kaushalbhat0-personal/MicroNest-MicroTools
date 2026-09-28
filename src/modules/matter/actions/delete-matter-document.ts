"use server";

import { revalidatePath } from "next/cache";
import { deleteMatterDocumentForCurrentFirm } from "../services/delete-matter-document";

export async function deleteMatterDocumentAction(_prev: unknown, formData: FormData) {
  const documentId = String(formData.get("documentId") ?? "");
  const result = await deleteMatterDocumentForCurrentFirm(documentId);
  if ("error" in result && result.error) return { error: result.error };
  revalidatePath("/app/matters");
  return { ok: true };
}
