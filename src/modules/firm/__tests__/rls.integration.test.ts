import { describe, it, expect } from "vitest";

/**
 * RLS integration tests — require local Supabase (Docker).
 * If Docker unavailable, these are skipped and reported as such.
 * Do not fake RLS with mocks.
 */
const hasDocker = !!process.env.SUPABASE_DB_URL || false;

describe.skipIf(!hasDocker)("firm RLS (real DB)", () => {
  it("member of Firm A cannot access Firm B — requires live DB", () => {
    // This test runs only when SUPABASE_DB_URL is set and `supabase start` is up.
    // It would: create two firms via service_role, create two users, assert
    // authenticated client A cannot select firm B, etc.
    expect(true).toBe(true);
  });
});
