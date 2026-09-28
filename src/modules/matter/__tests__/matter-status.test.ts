import { describe, expect, it } from "vitest";
import { canTransitionMatter } from "../permissions/matter-status";

describe("matter-status canTransitionMatter", () => {
  it("allows OPEN -> READY", () => expect(canTransitionMatter("open", "ready")).toBe(true));
  it("allows READY -> ARCHIVED", () => expect(canTransitionMatter("ready", "archived")).toBe(true));
  it("allows OPEN -> ARCHIVED", () => expect(canTransitionMatter("open", "archived")).toBe(true));
  it("rejects READY -> OPEN", () => expect(canTransitionMatter("ready", "open")).toBe(false));
  it("rejects ARCHIVED -> OPEN", () => expect(canTransitionMatter("archived", "open")).toBe(false));
  it("rejects OPEN -> OPEN", () => expect(canTransitionMatter("open", "open")).toBe(false));
  it("rejects ARCHIVED -> READY", () => expect(canTransitionMatter("archived", "ready")).toBe(false));
});
