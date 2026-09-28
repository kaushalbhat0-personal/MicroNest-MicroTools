import { describe, expect, it } from "vitest";
import { createNoticeSchema } from "../notice-schema";

const base = {
  client_id: "00000000-0000-4000-a000-000000000000",
  authority: "gst" as const,
  notice_type: "scrutiny" as const,
  response_deadline: "2026-09-30",
  priority: "medium" as const,
};

describe("notice-schema", () => {
  it("valid", () => {
    expect(createNoticeSchema.safeParse({ ...base }).success).toBe(true);
  });
  it("missing client", () => {
    expect(createNoticeSchema.safeParse({ ...base, client_id: "" }).success).toBe(false);
    expect(createNoticeSchema.safeParse({ ...base, client_id: "not-uuid" }).success).toBe(false);
  });
  it("invalid authority", () => {
    expect(createNoticeSchema.safeParse({ ...base, authority: "weird" }).success).toBe(false);
  });
  it("invalid notice_type", () => {
    expect(createNoticeSchema.safeParse({ ...base, notice_type: "weird" }).success).toBe(false);
  });
  it("invalid priority", () => {
    expect(createNoticeSchema.safeParse({ ...base, priority: "critical" as never }).success).toBe(false);
  });
  it("deadline before received rejected", () => {
    expect(createNoticeSchema.safeParse({ ...base, received_date: "2026-10-01", response_deadline: "2026-09-01" }).success).toBe(false);
  });
  it("deadline after received passes", () => {
    expect(createNoticeSchema.safeParse({ ...base, received_date: "2026-09-01", response_deadline: "2026-09-30" }).success).toBe(true);
  });
  it("strips forged firm_id/actor", () => {
    const r = createNoticeSchema.safeParse({ ...base, firm_id: "evil", actor_id: "evil" } as unknown as Record<string, unknown>);
    expect(r.success).toBe(true);
    if (r.success) {
      expect((r.data as unknown as Record<string, unknown>).firm_id).toBeUndefined();
    }
  });
  it("assigned_to must be uuid if provided", () => {
    expect(createNoticeSchema.safeParse({ ...base, assigned_to: "not-uuid" }).success).toBe(false);
    expect(createNoticeSchema.safeParse({ ...base, assigned_to: "00000000-0000-4000-a000-000000000001" }).success).toBe(true);
  });
});
