import { describe, expect, it } from "vitest";
import { canDeleteDocument, canUploadDocument, canViewDocuments } from "../document-permissions";

describe("document-permissions", () => {
  it("all members can view", () => {
    expect(canViewDocuments("member")).toBe(true);
    expect(canViewDocuments("owner")).toBe(true);
  });
  it("owner/admin can upload to any assigned", () => {
    expect(canUploadDocument("owner", "u1", "other")).toBe(true);
    expect(canUploadDocument("admin", "u1", "other")).toBe(true);
  });
  it("member can upload to own assigned", () => {
    expect(canUploadDocument("member", "m1", "m1")).toBe(true);
  });
  it("member cannot upload to another's assigned", () => {
    expect(canUploadDocument("member", "m1", "other")).toBe(false);
    expect(canUploadDocument("member", "m1", null)).toBe(false);
  });
  it("only owner/admin can delete", () => {
    expect(canDeleteDocument("owner")).toBe(true);
    expect(canDeleteDocument("member")).toBe(false);
  });
});
