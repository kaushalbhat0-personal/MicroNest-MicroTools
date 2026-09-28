"use server";

import { revalidatePath } from "next/cache";
import { transitionNoticeForCurrentFirm } from "../services/transition-notice";

export type TransitionState = { ok?: boolean; error?: string };

export async function transitionNoticeAction(_prev: TransitionState, formData: FormData): Promise<TransitionState> {
  const noticeId = String(formData.get("noticeId") ?? "");
  const targetStatus = String(formData.get("targetStatus") ?? "");
  const targetAssignedTo = formData.get("targetAssignedTo") ? String(formData.get("targetAssignedTo")) : null;

  const result = await transitionNoticeForCurrentFirm({ noticeId, targetStatus, targetAssignedTo });
  if ("ok" in result) {
    revalidatePath(`/app/notices/${noticeId}`);
    revalidatePath("/app/notices");
    return { ok: true };
  }
  return { error: result.error };
}
