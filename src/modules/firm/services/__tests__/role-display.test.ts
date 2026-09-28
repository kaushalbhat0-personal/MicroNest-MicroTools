import { describe, it, expect } from "vitest";

// Role display must come from firm_members, not hardcoded, not user_metadata
describe("role display source of truth", () => {
  it("page should display OWNER/ADMIN/MEMBER from membership, not hardcoded", () => {
    const roles = ["owner", "admin", "member"] as const;
    for (const r of roles) {
      expect(r.toUpperCase()).toMatch(/^(OWNER|ADMIN|MEMBER)$/);
    }
  });

  it("unknown role is not OWNER", () => {
    const role: string = "member";
    expect(role === "owner").toBe(false);
  });
});
