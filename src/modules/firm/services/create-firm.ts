import { createServerSupabaseClient } from "@/infrastructure/database/supabase-server";
import { createFirmSchema } from "../schemas/firm-schema";
import { createFirmAtomicViaRpc } from "../repositories/firm-repository";

/**
 * Thin service: validates input, delegates atomic creation to repository RPC.
 * - Never trusts client user_id/role/firm_id
 * - Transaction (firms + owner membership) is inside PostgreSQL RPC
 * - Slug generation is server-side in DB function
 */
export async function createFirmForCurrentUser(raw: unknown): Promise<{ firmId: string } | { error: string; fieldErrors?: Record<string, string[]> }> {
  const parsed = createFirmSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors as Record<string, string[]>;
    return { error: "Fix validation errors", fieldErrors };
  }

  let supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>;
  try {
    supabase = await createServerSupabaseClient();
  } catch {
    return { error: "Supabase not configured" };
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  try {
    const firmId = await createFirmAtomicViaRpc(supabase, parsed.data.name.trim());
    return { firmId };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to create firm";
    return { error: message };
  }
}
