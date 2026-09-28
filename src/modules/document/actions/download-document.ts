"use server";

import { redirect } from "next/navigation";
import { getDocumentSignedUrlForCurrentFirm } from "../services/get-document-url";

export async function downloadDocumentAction(formData: FormData): Promise<void> {
  const documentId = String(formData.get("documentId") ?? "");
  if (!documentId) return;
  const result = await getDocumentSignedUrlForCurrentFirm(documentId);
  if ("error" in result) return;
  redirect(result.url);
}
