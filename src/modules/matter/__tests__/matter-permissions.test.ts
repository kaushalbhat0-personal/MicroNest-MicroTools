import { describe, expect, it } from "vitest";
import {
  canViewMatters,
  canCreateMatter,
  canEditMatter,
  canUploadToMatter,
  canVerifyChecklist,
  canRejectChecklist,
  canArchiveMatter,
  canCreateMatterNote,
  canEditMatterNote,
} from "../permissions/matter-permissions";

const ownerId = "00000000-0000-4000-a000-000000000001";
const otherId = "00000000-0000-4000-a000-000000000002";

describe("matter-permissions", () => {
  it("owner/admin/member can view matters", () => {
    expect(canViewMatters("owner")).toBe(true);
    expect(canViewMatters("admin")).toBe(true);
    expect(canViewMatters("member")).toBe(true);
    expect(canViewMatters(null)).toBe(false);
  });
  it("only owner/admin can create matter — member cannot", () => {
    expect(canCreateMatter("owner")).toBe(true);
    expect(canCreateMatter("admin")).toBe(true);
    expect(canCreateMatter("member")).toBe(false);
  });
  it("only owner/admin can edit matter", () => {
    expect(canEditMatter("owner", ownerId, otherId)).toBe(true);
    expect(canEditMatter("admin", ownerId, null)).toBe(true);
    expect(canEditMatter("member", ownerId, ownerId)).toBe(false);
    expect(canEditMatter("member", ownerId, null)).toBe(false);
  });
  it("member upload only to assigned matters", () => {
    expect(canUploadToMatter("owner", ownerId, otherId)).toBe(true);
    expect(canUploadToMatter("admin", ownerId, null)).toBe(true);
    expect(canUploadToMatter("member", ownerId, ownerId)).toBe(true);
    expect(canUploadToMatter("member", ownerId, otherId)).toBe(false);
    expect(canUploadToMatter("member", ownerId, null)).toBe(false);
  });
  it("only owner/admin can verify/reject", () => {
    expect(canVerifyChecklist("owner")).toBe(true);
    expect(canVerifyChecklist("admin")).toBe(true);
    expect(canVerifyChecklist("member")).toBe(false);
    expect(canRejectChecklist("member")).toBe(false);
  });
  it("only owner/admin can archive / ready", () => {
    expect(canArchiveMatter("owner")).toBe(true);
    expect(canArchiveMatter("member")).toBe(false);
  });
  it("member create notes only on assigned", () => {
    expect(canCreateMatterNote("owner", ownerId, null)).toBe(true);
    expect(canCreateMatterNote("member", ownerId, ownerId)).toBe(true);
    expect(canCreateMatterNote("member", ownerId, otherId)).toBe(false);
    expect(canCreateMatterNote("member", ownerId, null)).toBe(false);
  });
  it("member edit/delete own notes only on assigned", () => {
    expect(canEditMatterNote("owner", ownerId, null, otherId)).toBe(true);
    expect(canEditMatterNote("member", ownerId, ownerId, ownerId)).toBe(true);
    expect(canEditMatterNote("member", ownerId, ownerId, otherId)).toBe(false);
    expect(canEditMatterNote("member", ownerId, otherId, ownerId)).toBe(false);
  });
  it("solo owner works without assigned_to", () => {
    expect(canUploadToMatter("owner", ownerId, null)).toBe(true);
    expect(canCreateMatterNote("owner", ownerId, null)).toBe(true);
  });
  it("forged role denied", () => {
    expect(canCreateMatter("superadmin" as never)).toBe(false);
    expect(canVerifyChecklist("superadmin" as never)).toBe(false);
  });
});
