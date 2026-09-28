import { describe, expect, it } from "vitest";
import { getProfession, getTool, professions, tools } from "../microtools";

describe("microtools content", () => {
  it("resolves NoticeFlow", () => {
    expect(getTool("noticeflow")?.name).toBe("NoticeFlow");
    expect(getTool("unknown")).toBeUndefined();
  });
  it("resolves profession", () => {
    expect(getProfession("chartered-accountants")?.name).toBe("Chartered Accountants");
    expect(getProfession("unknown")).toBeUndefined();
  });
  it("profession contains tools", () => {
    expect(professions[0].tools.length).toBeGreaterThan(0);
  });
  it("tools have required fields", () => {
    for (const t of tools) {
      expect(t.slug).toBeTruthy();
      expect(t.href).toBeTruthy();
      expect(t.appHref).toBeTruthy();
    }
  });
});
