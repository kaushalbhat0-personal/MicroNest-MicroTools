"use server";

import { revalidatePath } from "next/cache";
import { createMatterNoteForCurrentFirm, updateMatterNoteForCurrentFirm, deleteMatterNoteForCurrentFirm } from "../services/matter-note-service";

export async function createMatterNoteAction(_prev: unknown, formData: FormData) {
  const matterId = String(formData.get("matterId") ?? "");
  const content = String(formData.get("content") ?? "");
  const result = await createMatterNoteForCurrentFirm({ matterId, content });
  if ("error" in result && result.error) return { error: result.error };
  revalidatePath(`/app/matters/${matterId}`);
  return { ok: true };
}

export async function updateMatterNoteAction(_prev: unknown, formData: FormData) {
  const noteId = String(formData.get("noteId") ?? "");
  const content = String(formData.get("content") ?? "");
  const result = await updateMatterNoteForCurrentFirm({ noteId, content });
  if ("error" in result && result.error) return { error: result.error };
  revalidatePath("/app/matters");
  return { ok: true };
}

export async function deleteMatterNoteAction(_prev: unknown, formData: FormData) {
  const noteId = String(formData.get("noteId") ?? "");
  const result = await deleteMatterNoteForCurrentFirm(noteId);
  if ("error" in result && result.error) return { error: result.error };
  revalidatePath("/app/matters");
  return { ok: true };
}
