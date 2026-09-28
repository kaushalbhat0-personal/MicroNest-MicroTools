import { describe, expect, it } from "vitest";
import { createMatterNoteSchema } from "../schemas/matter-note-schema";

describe("matter-note-schema", () => {
  it("valid", () => {
    expect(
      createMatterNoteSchema.safeParse({ matterId: "00000000-0000-4000-a000-000000000000", content: "hello" }).success,
    ).toBe(true);
  });
  it("content 1..5000", () => {
    expect(createMatterNoteSchema.safeParse({ matterId: "00000000-0000-4000-a000-000000000000", content: "" }).success).toBe(false);
    expect(createMatterNoteSchema.safeParse({ matterId: "00000000-0000-4000-a000-000000000000", content: "a".repeat(5001) }).success).toBe(false);
    expect(createMatterNoteSchema.safeParse({ matterId: "00000000-0000-4000-a000-000000000000", content: "a".repeat(5000) }).success).toBe(true);
  });
  it("matterId must be uuid", () => {
    expect(createMatterNoteSchema.safeParse({ matterId: "not-uuid", content: "hi" }).success).toBe(false);
  });
});
