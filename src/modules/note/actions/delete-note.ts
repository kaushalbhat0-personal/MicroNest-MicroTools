"use server";

import { revalidatePath } from "next/cache";
import { deleteNoteForCurrentFirm } from "../services/delete-note";

export async function deleteNoteAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const noticeId = String(formData.get("noticeId") ?? "");
  if (!id) return;
  await deleteNoteForCurrentFirm(id);
  if (noticeId) revalidatePath(`/app/notices/${noticeId}`);
}
