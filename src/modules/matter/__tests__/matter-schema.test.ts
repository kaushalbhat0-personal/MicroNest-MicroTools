import { describe, expect, it } from "vitest";
import { createMatterSchema, updateMatterSchema } from "../schemas/matter-schema";

const validBase = {
  title: "Test Matter",
  matter_type: "civil",
  client_id: "00000000-0000-4000-a000-000000000000",
};

describe("matter-schema", () => {
  it("valid create", () => {
    expect(createMatterSchema.safeParse({ ...validBase }).success).toBe(true);
  });
  it("title required trimmed 1..200", () => {
    expect(createMatterSchema.safeParse({ ...validBase, title: "" }).success).toBe(false);
    expect(createMatterSchema.safeParse({ ...validBase, title: "   " }).success).toBe(false);
    expect(createMatterSchema.safeParse({ ...validBase, title: "a".repeat(201) }).success).toBe(false);
    expect(createMatterSchema.safeParse({ ...validBase, title: "  ok  " }).success).toBe(true);
  });
  it("matter_type enum strict", () => {
    expect(createMatterSchema.safeParse({ ...validBase, matter_type: "civil" }).success).toBe(true);
    expect(createMatterSchema.safeParse({ ...validBase, matter_type: "criminal" }).success).toBe(true);
    expect(createMatterSchema.safeParse({ ...validBase, matter_type: "weird" }).success).toBe(false);
  });
  it("client_id must be uuid", () => {
    expect(createMatterSchema.safeParse({ ...validBase, client_id: "not-uuid" }).success).toBe(false);
    expect(createMatterSchema.safeParse({ ...validBase, client_id: "" }).success).toBe(false);
  });
  it("assigned_to must be uuid if provided", () => {
    expect(createMatterSchema.safeParse({ ...validBase, assigned_to: "not-uuid" }).success).toBe(false);
    expect(createMatterSchema.safeParse({ ...validBase, assigned_to: "00000000-0000-4000-a000-000000000001" }).success).toBe(true);
    expect(createMatterSchema.safeParse({ ...validBase, assigned_to: "" }).success).toBe(true);
    expect(createMatterSchema.safeParse({ ...validBase, assigned_to: null }).success).toBe(true);
  });
  it("next_action max 500", () => {
    expect(createMatterSchema.safeParse({ ...validBase, next_action: "a".repeat(501) }).success).toBe(false);
    expect(createMatterSchema.safeParse({ ...validBase, next_action: "a".repeat(500) }).success).toBe(true);
  });
  it("strips forged firm_id / actor", () => {
    const r = createMatterSchema.safeParse({ ...validBase, firm_id: "evil", actor_id: "evil" } as unknown as Record<string, unknown>);
    expect(r.success).toBe(true);
    if (r.success) {
      expect((r.data as unknown as Record<string, unknown>).firm_id).toBeUndefined();
    }
  });
  it("update schema requires id", () => {
    expect(updateMatterSchema.safeParse({ id: "00000000-0000-4000-a000-000000000000", title: "Ok" }).success).toBe(true);
    expect(updateMatterSchema.safeParse({ title: "Ok" } as unknown as Record<string, unknown>).success).toBe(false);
  });
  it("matter_type not allowed in update (V1 prohibits)", () => {
    const r = updateMatterSchema.safeParse({ id: "00000000-0000-4000-a000-000000000000", title: "Ok", matter_type: "civil" } as unknown as Record<string, unknown>);
    // update schema does not have matter_type, so extra field is stripped; we check that parsed data doesn't contain it
    expect(r.success).toBe(true);
    if (r.success) {
      expect((r.data as unknown as Record<string, unknown>).matter_type).toBeUndefined();
    }
  });
});
