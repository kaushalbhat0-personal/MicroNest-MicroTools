"use server";

import { revalidatePath } from "next/cache";
import { uploadDocumentForCurrentFirm } from "../services/upload-document";

export type UploadState = { ok?: boolean; error?: string };

export async function uploadDocumentAction(_prev: UploadState, formData: FormData): Promise<UploadState> {
  const noticeId = String(formData.get("noticeId") ?? "");
  const file = formData.get("file") as File | null;
  if (!noticeId) return { error: "Notice required" };
  if (!file || file.size === 0) return { error: "File required" };

  const result = await uploadDocumentForCurrentFirm({ noticeId, file });
  if ("error" in result) return { error: result.error };
  revalidatePath(`/app/notices/${noticeId}`);
  return { ok: true };
}
