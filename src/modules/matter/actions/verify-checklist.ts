"use server";

import { revalidatePath } from "next/cache";
import { verifyChecklistItemForCurrentFirm, rejectChecklistItemForCurrentFirm } from "../services/verify-checklist-item";

export async function verifyChecklistAction(_prev: unknown, formData: FormData) {
  const id = String(formData.get("checklistItemId") ?? "");
  const result = await verifyChecklistItemForCurrentFirm(id);
  if ("error" in result && result.error) return { error: result.error };
  revalidatePath("/app/matters");
  return { ok: true };
}

export async function rejectChecklistAction(_prev: unknown, formData: FormData) {
  const id = String(formData.get("checklistItemId") ?? "");
  const result = await rejectChecklistItemForCurrentFirm(id);
  if ("error" in result && result.error) return { error: result.error };
  revalidatePath("/app/matters");
  return { ok: true };
}

// Backwards compat for direct call
export async function verifyChecklistActionDirect(formData: FormData) {
  return verifyChecklistAction(null, formData);
}
export async function rejectChecklistActionDirect(formData: FormData) {
  return rejectChecklistAction(null, formData);
}
