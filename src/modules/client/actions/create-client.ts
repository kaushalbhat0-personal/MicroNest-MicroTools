"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClientForCurrentFirm } from "../services/create-client";

export type CreateClientState = { error?: string; fieldErrors?: Record<string, string[]> };

export async function createClientAction(_prev: CreateClientState, formData: FormData): Promise<CreateClientState> {
  const raw = {
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
  // Flatten address handling: if all empty, omit
  const addr = raw.address.line1 || raw.address.city || raw.address.state || raw.address.postalCode ? raw.address : undefined;
  const result = await createClientForCurrentFirm({ name: raw.name, email: raw.email, phone: raw.phone, address: addr });
  if ("client" in result) {
    revalidatePath("/app/clients");
    redirect("/app/clients");
  }
  return { error: result.error, fieldErrors: result.fieldErrors };
}
