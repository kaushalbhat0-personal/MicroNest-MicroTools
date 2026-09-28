import { createClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client — SERVER ONLY.
 * Never import from "use client" components. Bypasses RLS.
 * Phase 0: exported for future Storage + activity_log use; not called yet.
 */
export function createServiceSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY (server-only)",
    );
  }
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
