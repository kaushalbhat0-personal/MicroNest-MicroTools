"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { updateNoticeForCurrentFirm } from "../services/update-notice";

export type UpdateNoticeState = { error?: string; fieldErrors?: Record<string, string[]> };

export async function updateNoticeAction(_prev: UpdateNoticeState, formData: FormData): Promise<UpdateNoticeState> {
  const raw = {
    id: String(formData.get("id") ?? ""),
    client_id: String(formData.get("client_id") ?? ""),
    reference_number: String(formData.get("reference_number") ?? ""),
    authority: String(formData.get("authority") ?? ""),
    notice_type: String(formData.get("notice_type") ?? ""),
    received_date: String(formData.get("received_date") ?? ""),
    response_deadline: String(formData.get("response_deadline") ?? ""),
    priority: String(formData.get("priority") ?? "medium"),
    assigned_to: String(formData.get("assigned_to") ?? ""),
    next_action: String(formData.get("next_action") ?? ""),
    next_action_date: String(formData.get("next_action_date") ?? ""),
  };
  const result = await updateNoticeForCurrentFirm(raw);
  if ("notice" in result && result.notice) {
    revalidatePath("/app/notices");
    redirect(`/app/notices/${result.notice.id}`);
  }
  return { error: (result as { error?: string }).error, fieldErrors: (result as { fieldErrors?: Record<string, string[]> }).fieldErrors };
}
