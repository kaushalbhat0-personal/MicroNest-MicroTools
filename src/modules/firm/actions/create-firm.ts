"use server";

import { redirect } from "next/navigation";
import { createFirmForCurrentUser } from "../services/create-firm";

export type CreateFirmState = { error?: string; fieldErrors?: Record<string, string[]> };

export async function createFirmAction(_prev: CreateFirmState, formData: FormData): Promise<CreateFirmState> {
  const raw = { name: String(formData.get("name") ?? "") };
  const result = await createFirmForCurrentUser(raw);
  if ("firmId" in result) redirect("/app");
  return { error: result.error, fieldErrors: result.fieldErrors };
}
