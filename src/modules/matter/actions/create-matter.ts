"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createMatterForCurrentFirm } from "../services/create-matter";

export type CreateMatterState = { error?: string; fieldErrors?: Record<string, string[]> };

export async function createMatterAction(_prev: CreateMatterState, formData: FormData): Promise<CreateMatterState> {
  const raw = {
    title: String(formData.get("title") ?? ""),
    matter_type: String(formData.get("matter_type") ?? ""),
    client_id: String(formData.get("client_id") ?? ""),
    assigned_to: String(formData.get("assigned_to") ?? ""),
    next_action: String(formData.get("next_action") ?? ""),
    next_action_date: String(formData.get("next_action_date") ?? ""),
    deadline: String(formData.get("deadline") ?? ""),
  };
  const result = await createMatterForCurrentFirm(raw);
  if ("matter" in result && result.matter) {
    revalidatePath("/app/matters");
    redirect(`/app/matters/${result.matter.id}`);
  }
  return { error: (result as { error?: string }).error, fieldErrors: (result as { fieldErrors?: Record<string, string[]> }).fieldErrors };
}
