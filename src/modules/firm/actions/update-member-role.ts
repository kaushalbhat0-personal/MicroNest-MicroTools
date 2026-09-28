"use server";

import { revalidatePath } from "next/cache";
import { updateMemberRoleForCurrentFirm } from "../services/update-member-role";

export type UpdateMemberRoleState = { ok?: boolean; error?: string; fieldErrors?: Record<string, string[]> };

export async function updateMemberRoleAction(_prev: UpdateMemberRoleState, formData: FormData): Promise<UpdateMemberRoleState> {
  const raw = {
    memberId: String(formData.get("memberId") ?? ""),
    role: String(formData.get("role") ?? ""),
  };
  const result = await updateMemberRoleForCurrentFirm(raw);
  if ("ok" in result) {
    revalidatePath("/app/members");
    return { ok: true };
  }
  return { error: result.error, fieldErrors: result.fieldErrors };
}
