"use server";

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/infrastructure/database/supabase-server";

export async function signOutAction(): Promise<void> {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/login");
}
