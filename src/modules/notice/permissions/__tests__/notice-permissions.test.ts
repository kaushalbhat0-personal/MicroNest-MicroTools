import { describe, expect, it } from "vitest";
import { canAssignNotice, canCreateNotice, canEditNotice, canSetAssignedTo, canViewNotices } from "../notice-permissions";

describe("notice-permissions", () => {
  const ownerId = "00000000-0000-4000-a000-000000000001";
  const otherId = "00000000-0000-4000-a000-000000000002";

  it("owner/admin/member can view/create", () => {
    expect(canViewNotices("member")).toBe(true);
    expect(canCreateNotice("member")).toBe(true);
    expect(canViewNotices(null)).toBe(false);
  });

  it("1. OWNER can edit", () => {
    expect(canEditNotice("owner", ownerId, otherId)).toBe(true);
  });
  it("2. ADMIN can edit", () => {
    expect(canEditNotice("admin", ownerId, otherId)).toBe(true);
  });
  it("3. MEMBER can edit their assigned notice", () => {
    expect(canEditNotice("member", ownerId, ownerId)).toBe(true);
  });
  it("4. MEMBER cannot edit another member's assigned notice", () => {
    expect(canEditNotice("member", ownerId, otherId)).toBe(false);
  });
  it("5. MEMBER cannot edit unassigned notice", () => {
    expect(canEditNotice("member", ownerId, null)).toBe(false);
  });

  it("only owner/admin can assign", () => {
    expect(canAssignNotice("owner")).toBe(true);
    expect(canAssignNotice("admin")).toBe(true);
    expect(canAssignNotice("member")).toBe(false);
  });

  it("6. MEMBER cannot assign to another member", () => {
    expect(canSetAssignedTo("member", ownerId, otherId)).toBe(false);
  });
  it("7. MEMBER can create unassigned", () => {
    expect(canSetAssignedTo("member", ownerId, null)).toBe(true);
  });
  it("8. MEMBER can create assigned to self", () => {
    expect(canSetAssignedTo("member", ownerId, ownerId)).toBe(true);
  });
  it("9. MEMBER cannot create assigned to another member", () => {
    expect(canSetAssignedTo("member", ownerId, otherId)).toBe(false);
  });

  it("10. OWNER can assign to same-firm member", () => {
    expect(canSetAssignedTo("owner", ownerId, otherId)).toBe(true);
  });
  it("11. ADMIN can assign to same-firm member", () => {
    expect(canSetAssignedTo("admin", ownerId, otherId)).toBe(true);
  });

  it("forged role denied", () => {
    expect(canCreateNotice("superadmin" as never)).toBe(false);
  });
});
