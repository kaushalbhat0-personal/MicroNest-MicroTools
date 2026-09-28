"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { updateMatterForCurrentFirm } from "../services/update-matter";

export type UpdateMatterState = { error?: string; fieldErrors?: Record<string, string[]> };

export async function updateMatterAction(_prev: UpdateMatterState, formData: FormData): Promise<UpdateMatterState> {
  const raw = {
    id: String(formData.get("id") ?? ""),
    title: String(formData.get("title") ?? ""),
    assigned_to: String(formData.get("assigned_to") ?? ""),
    next_action: String(formData.get("next_action") ?? ""),
    next_action_date: String(formData.get("next_action_date") ?? ""),
    deadline: String(formData.get("deadline") ?? ""),
  };
  const result = await updateMatterForCurrentFirm(raw);
  if ("matter" in result && result.matter) {
    revalidatePath("/app/matters");
    redirect(`/app/matters/${result.matter.id}`);
  }
  return { error: (result as { error?: string }).error, fieldErrors: (result as { fieldErrors?: Record<string, string[]> }).fieldErrors };
}
