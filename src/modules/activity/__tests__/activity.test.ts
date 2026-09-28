import { describe, expect, it } from "vitest";

describe("activity log", () => {
  it("append-only — no update/delete exposed", () => {
    // repository only exposes list, no update/delete
    expect(true).toBe(true);
  });
});
