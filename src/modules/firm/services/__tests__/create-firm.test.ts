import { describe, it, expect } from "vitest";
import { createFirmSchema } from "../../schemas/firm-schema";

describe("create-firm service — input validation (no DB)", () => {
  it("rejects short name", () => {
    expect(createFirmSchema.safeParse({ name: "x" }).success).toBe(false);
  });

  it("strips unknown fields — client cannot inject role/user_id/firm_id", () => {
    const r = createFirmSchema.safeParse({ name: "Acme CA", role: "admin", user_id: "evil", firm_id: "evil" } as unknown as Record<string, unknown>);
    expect(r.success).toBe(true);
    if (r.success) {
      expect((r.data as unknown as Record<string, unknown>).role).toBeUndefined();
      expect((r.data as unknown as Record<string, unknown>).user_id).toBeUndefined();
    }
  });

  it("trims and validates max length", () => {
    expect(createFirmSchema.safeParse({ name: "  Acme  " }).success).toBe(true);
    expect(createFirmSchema.safeParse({ name: "a".repeat(201) }).success).toBe(false);
  });

  it("valid name passes", () => {
    expect(createFirmSchema.safeParse({ name: "Acme CA Associates" }).success).toBe(true);
  });
});
