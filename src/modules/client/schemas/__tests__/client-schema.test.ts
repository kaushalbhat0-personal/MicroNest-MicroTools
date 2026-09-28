import { describe, expect, it } from "vitest";
import { createClientSchema, updateClientSchema, archiveClientSchema } from "../client-schema";

describe("client-schema", () => {
  it("requires name", () => {
    expect(createClientSchema.safeParse({ name: "" }).success).toBe(false);
    expect(createClientSchema.safeParse({ name: "Acme" }).success).toBe(true);
  });

  it("validates email phone optional", () => {
    expect(createClientSchema.safeParse({ name: "Acme", email: "bad" }).success).toBe(false);
    expect(createClientSchema.safeParse({ name: "Acme", email: "a@b.co" }).success).toBe(true);
    expect(createClientSchema.safeParse({ name: "Acme", phone: "1234567" }).success).toBe(true);
  });

  it("strips forged firm_id/user_id", () => {
    const r = createClientSchema.safeParse({ name: "Acme", firm_id: "evil" } as unknown as Record<string, unknown>);
    expect(r.success).toBe(true);
    if (r.success) expect((r.data as unknown as Record<string, unknown>).firm_id).toBeUndefined();
  });

  it("rejects malformed id on update", () => {
    expect(updateClientSchema.safeParse({ id: "not-uuid", name: "Acme" }).success).toBe(false);
  });

  it("archive requires uuid and boolean", () => {
    expect(archiveClientSchema.safeParse({ id: "00000000-0000-4000-a000-000000000000", is_archived: true }).success).toBe(true);
  });

  it("omits PAN/GSTIN — not in schema", () => {
    const r = createClientSchema.safeParse({ name: "Acme", pan: "ABCDE1234F" } as unknown as Record<string, unknown>);
    expect(r.success).toBe(true);
    if (r.success) expect((r.data as unknown as Record<string, unknown>).pan).toBeUndefined();
  });
});
