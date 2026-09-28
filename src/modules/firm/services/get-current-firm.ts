import { createServerSupabaseClient } from "@/infrastructure/database/supabase-server";
import { getFirmsForUser } from "../repositories/firm-repository";

/**
 * Returns the active firm for the current session.
 * Phase 1: single firm — first membership. No switcher.
 * No client-provided firm_id is trusted.
 */
export async function getCurrentFirmForSession() {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { user: null, firm: null } as const;

    const firms = await getFirmsForUser(supabase, user.id);
    const firm = firms[0] ?? null;
    return { user, firm } as const;
  } catch {
    return { user: null, firm: null } as const;
  }
}
