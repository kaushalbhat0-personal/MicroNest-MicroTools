"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { archiveMatterForCurrentFirm } from "../services/archive-matter";

export async function archiveMatterAction(formData: FormData) {
  const id = String(formData.get("matterId") ?? "");
  const result = await archiveMatterForCurrentFirm(id);
  if ("error" in result && result.error) return { error: result.error };
  revalidatePath("/app/matters");
  redirect("/app/matters");
}
