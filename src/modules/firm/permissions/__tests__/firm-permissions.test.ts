import { describe, expect, it } from "vitest";
import { canAccessFirm, canManageMembers, isOwner, isOwnerOrAdmin } from "../firm-permissions";

describe("firm-permissions", () => {
  it("owner/admin can manage members, member cannot", () => {
    expect(canManageMembers("owner")).toBe(true);
    expect(canManageMembers("admin")).toBe(true);
    expect(canManageMembers("member")).toBe(false);
    expect(canManageMembers(null)).toBe(false);
  });

  it("owner/admin/member can access firm, null cannot", () => {
    expect(canAccessFirm("member")).toBe(true);
    expect(canAccessFirm(null)).toBe(false);
  });

  it("isOwner/isOwnerOrAdmin", () => {
    expect(isOwner("owner")).toBe(true);
    expect(isOwner("admin")).toBe(false);
    expect(isOwnerOrAdmin("admin")).toBe(true);
    expect(isOwnerOrAdmin("member")).toBe(false);
  });

  it("forged role string is denied (type safety)", () => {
    // any string not in enum should be treated as not owner/admin
    expect(canManageMembers("superadmin" as never)).toBe(false);
  });
});
