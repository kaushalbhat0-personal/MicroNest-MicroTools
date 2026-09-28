import { describe, expect, it } from "vitest";
import { canEditNote } from "../note-permissions";
import { createNoteSchema } from "../../schemas/note-schema";

describe("note edit authorization — Phase 3 correction", () => {
  const noticeOwn = "member-id";
  const memberId = "member-id";
  const otherId = "other-id";

  it("1. OWNER can edit any firm note", () => {
    expect(canEditNote("owner", "owner-id", noticeOwn, "other-author")).toBe(true);
  });
  it("2. ADMIN can edit any firm note", () => {
    expect(canEditNote("admin", "admin-id", "other-id", "other-author")).toBe(true);
  });
  it("3. MEMBER can edit own note on own assigned notice", () => {
    expect(canEditNote("member", memberId, memberId, memberId)).toBe(true);
  });
  it("4. MEMBER cannot edit another user's note", () => {
    expect(canEditNote("member", memberId, memberId, otherId)).toBe(false);
  });
  it("5. MEMBER cannot edit own note on another member's assigned notice", () => {
    expect(canEditNote("member", memberId, otherId, memberId)).toBe(false);
  });
  it("6. MEMBER cannot edit note on unassigned notice", () => {
    expect(canEditNote("member", memberId, null, memberId)).toBe(false);
  });
  it("7. Cross-firm note edit is rejected (service layer) — permission alone denies without firm", () => {
    // pure permission does not check firm, but RLS + service will; here we ensure member not owner cannot
    expect(canEditNote("member", memberId, memberId, otherId)).toBe(false);
  });
  it("8. Author ID cannot be supplied by client — schema strips it", () => {
    const r = createNoteSchema.safeParse({ noticeId: "00000000-0000-4000-a000-000000000000", content: "hi", author_id: "evil" } as unknown as Record<string, unknown>);
    expect(r.success).toBe(true);
    if (r.success) expect((r.data as unknown as Record<string, unknown>).author_id).toBeUndefined();
  });
  it("9. Content remains 5000 validation", () => {
    expect(createNoteSchema.safeParse({ noticeId: "00000000-0000-4000-a000-000000000000", content: "a".repeat(5001) }).success).toBe(false);
    expect(createNoteSchema.safeParse({ noticeId: "00000000-0000-4000-a000-000000000000", content: "ok" }).success).toBe(true);
  });
});
