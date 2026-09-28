"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { updateClientForCurrentFirm } from "../services/update-client";

export type UpdateClientState = { error?: string; fieldErrors?: Record<string, string[]> };

export async function updateClientAction(_prev: UpdateClientState, formData: FormData): Promise<UpdateClientState> {
  const raw = {
    id: String(formData.get("id") ?? ""),
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    address: {
      line1: String(formData.get("address.line1") ?? ""),
      city: String(formData.get("city") ?? ""),
      state: String(formData.get("state") ?? ""),
      postalCode: String(formData.get("postalCode") ?? ""),
    },
  };
  const addr = raw.address.line1 || raw.address.city || raw.address.state || raw.address.postalCode ? raw.address : undefined;
  const result = await updateClientForCurrentFirm({ id: raw.id, name: raw.name, email: raw.email, phone: raw.phone, address: addr });
  if ("client" in result) {
    revalidatePath("/app/clients");
    redirect("/app/clients");
  }
  return { error: result.error, fieldErrors: result.fieldErrors };
}
