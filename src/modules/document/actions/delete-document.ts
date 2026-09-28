"use server";

import { revalidatePath } from "next/cache";
import { deleteDocumentForCurrentFirm } from "../services/delete-document";

export async function deleteDocumentAction(formData: FormData): Promise<void> {
  const documentId = String(formData.get("documentId") ?? "");
  const noticeId = String(formData.get("noticeId") ?? "");
  if (!documentId) return;
  await deleteDocumentForCurrentFirm(documentId);
  if (noticeId) revalidatePath(`/app/notices/${noticeId}`);
}
