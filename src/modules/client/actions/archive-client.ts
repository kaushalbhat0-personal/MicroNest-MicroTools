"use server";

import { revalidatePath } from "next/cache";
import { archiveClientForCurrentFirm } from "../services/archive-client";

export async function archiveClientAction(formData: FormData): Promise<void> {
  const raw = {
    id: String(formData.get("id") ?? ""),
    is_archived: String(formData.get("is_archived") ?? "false") === "true",
  };
  await archiveClientForCurrentFirm(raw);
  revalidatePath("/app/clients");
}
