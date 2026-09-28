// Phase 0 — env validation placeholder
// Phase 1+ will add zod-validated parsing for Supabase vars.
// No secrets are read here at build time to keep Vercel preview simple.
export const env = {
  // Public (NEXT_PUBLIC_*) — safe for browser
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  // Server-only — never import in "use client" components
  // SUPABASE_SERVICE_ROLE_KEY available only via supabase-service.ts
  appUrl: process.env.NEXT_PUBLIC_APP_URL,
} as const;
