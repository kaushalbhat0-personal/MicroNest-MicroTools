"use server";

import { revalidatePath } from "next/cache";
import { createNoteForCurrentFirm } from "../services/create-note";

export type CreateNoteState = { ok?: boolean; error?: string; fieldErrors?: Record<string, string[]> };

export async function createNoteAction(_prev: CreateNoteState, formData: FormData): Promise<CreateNoteState> {
  const raw = {
    noticeId: String(formData.get("noticeId") ?? ""),
    content: String(formData.get("content") ?? ""),
  };
  const result = await createNoteForCurrentFirm(raw);
  if ("note" in result) {
    revalidatePath(`/app/notices/${raw.noticeId}`);
    return { ok: true };
  }
  return { error: result.error, fieldErrors: result.fieldErrors };
}
