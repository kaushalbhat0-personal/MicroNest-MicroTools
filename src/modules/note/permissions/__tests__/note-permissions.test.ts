import { describe, expect, it } from "vitest";
import { canCreateNote, canDeleteNote, canEditNote, canViewNotes } from "../note-permissions";

describe("note-permissions", () => {
  it("all can view", () => {
    expect(canViewNotes("member")).toBe(true);
  });
  it("owner/admin can create any", () => {
    expect(canCreateNote("owner", "u1", "other")).toBe(true);
    expect(canCreateNote("admin", "u1", null)).toBe(true);
  });
  it("member can create only on own assigned", () => {
    expect(canCreateNote("member", "m1", "m1")).toBe(true);
    expect(canCreateNote("member", "m1", "other")).toBe(false);
    expect(canCreateNote("member", "m1", null)).toBe(false);
  });
  it("member can edit/delete only own note on own assigned", () => {
    expect(canEditNote("member", "m1", "m1", "m1")).toBe(true);
    expect(canEditNote("member", "m1", "m1", "other")).toBe(false);
    expect(canEditNote("member", "m1", "other", "m1")).toBe(false);
    expect(canDeleteNote("member", "m1", "m1", "m1")).toBe(true);
  });
  it("owner/admin can edit any in firm", () => {
    expect(canEditNote("owner", "o1", "other", "other2")).toBe(true);
  });
});
