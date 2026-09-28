"use server";

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/infrastructure/database/supabase-server";
import { signInSchema } from "../schemas/auth-schema";

export type SignInState = { error?: string; fieldErrors?: Record<string, string[]> };

export async function signInAction(_prev: SignInState, formData: FormData): Promise<SignInState> {
  const raw = {
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  };
  const parsed = signInSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Fix validation errors", fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });
  if (error) return { error: error.message };
  redirect("/app");
}
