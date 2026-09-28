import { describe, expect, it } from "vitest";
import { updateMemberRoleSchema } from "../member-schema";

describe("member-schema", () => {
  it("requires uuid and member|admin", () => {
    expect(updateMemberRoleSchema.safeParse({ memberId: "not-uuid", role: "member" }).success).toBe(false);
    expect(updateMemberRoleSchema.safeParse({ memberId: "00000000-0000-4000-a000-000000000000", role: "owner" }).success).toBe(false);
  });

  it("accepts member/admin", () => {
    expect(updateMemberRoleSchema.safeParse({ memberId: "00000000-0000-4000-a000-000000000000", role: "member" }).success).toBe(true);
    expect(updateMemberRoleSchema.safeParse({ memberId: "00000000-0000-4000-a000-000000000000", role: "admin" }).success).toBe(true);
  });

  it("strips forged firm_id/user_id", () => {
    const r = updateMemberRoleSchema.safeParse({ memberId: "00000000-0000-4000-a000-000000000000", role: "admin", firm_id: "evil", user_id: "evil" } as unknown as Record<string, unknown>);
    expect(r.success).toBe(true);
    if (r.success) expect((r.data as unknown as Record<string, unknown>).firm_id).toBeUndefined();
  });

  it("rejects invalid role escalation to owner via schema", () => {
    expect(updateMemberRoleSchema.safeParse({ memberId: "00000000-0000-4000-a000-000000000000", role: "owner" }).success).toBe(false);
  });
});
