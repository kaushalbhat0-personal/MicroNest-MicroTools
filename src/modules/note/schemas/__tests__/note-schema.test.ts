import { describe, expect, it } from "vitest";
import { createNoteSchema } from "../note-schema";

describe("note-schema", () => {
  it("requires non-empty content", () => {
    expect(createNoteSchema.safeParse({ noticeId: "00000000-0000-4000-a000-000000000000", content: "" }).success).toBe(false);
    expect(createNoteSchema.safeParse({ noticeId: "00000000-0000-4000-a000-000000000000", content: "hello" }).success).toBe(true);
  });
  it("rejects too long", () => {
    expect(createNoteSchema.safeParse({ noticeId: "00000000-0000-4000-a000-000000000000", content: "a".repeat(5001) }).success).toBe(false);
  });
  it("requires uuid", () => {
    expect(createNoteSchema.safeParse({ noticeId: "not-uuid", content: "hi" }).success).toBe(false);
  });
});
