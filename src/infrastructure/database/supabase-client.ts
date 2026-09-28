import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser Supabase client — public anon key only, RLS-enforced.
 * Safe for "use client" components.
 */
export function createBrowserSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY",
    );
  }
  return createBrowserClient(url, anonKey);
}
