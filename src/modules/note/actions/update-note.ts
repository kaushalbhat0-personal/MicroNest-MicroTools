"use server";

import { revalidatePath } from "next/cache";
import { updateNoteForCurrentFirm } from "../services/update-note";

export async function updateNoteAction(formData: FormData): Promise<void> {
  const raw = {
    id: String(formData.get("id") ?? ""),
    content: String(formData.get("content") ?? ""),
  };
  await updateNoteForCurrentFirm(raw);
  // Derive noticeId via note lookup is inside service; revalidate is generic
  revalidatePath("/app/notices");
}
