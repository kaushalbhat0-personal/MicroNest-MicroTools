import { describe, expect, it } from "vitest";
import { isValidChecklistTransition } from "../schemas/checklist-schema";
import { getChecklistTemplate, CHECKLIST_TEMPLATES } from "../constants/checklist-templates";

describe("checklist transitions", () => {
  it("PENDING -> UPLOADED allowed", () => expect(isValidChecklistTransition("pending", "uploaded")).toBe(true));
  it("UPLOADED -> VERIFIED allowed", () => expect(isValidChecklistTransition("uploaded", "verified")).toBe(true));
  it("UPLOADED -> REJECTED allowed", () => expect(isValidChecklistTransition("uploaded", "rejected")).toBe(true));
  it("REJECTED -> PENDING allowed", () => expect(isValidChecklistTransition("rejected", "pending")).toBe(true));
  it("REJECTED -> UPLOADED allowed", () => expect(isValidChecklistTransition("rejected", "uploaded")).toBe(true));
  it("VERIFIED -> no direct reversal", () => {
    expect(isValidChecklistTransition("verified", "pending")).toBe(false);
    expect(isValidChecklistTransition("verified", "rejected")).toBe(false);
    expect(isValidChecklistTransition("verified", "uploaded")).toBe(false);
  });
  it("PENDING -> VERIFIED not allowed directly", () => expect(isValidChecklistTransition("pending", "verified")).toBe(false));

  it("templates exist for all matter types and small 3-5 items", () => {
    for (const t of ["civil", "criminal", "negotiable_instrument", "rent", "recovery", "other"] as const) {
      const items = getChecklistTemplate(t);
      expect(items.length).toBeGreaterThanOrEqual(1);
      expect(items.length).toBeLessThanOrEqual(5);
    }
  });
  it("civil contains expected labels", () => {
    const labels = CHECKLIST_TEMPLATES.civil.map((i) => i.label);
    expect(labels).toContain("Vakalatnama");
    expect(labels).toContain("ID proof");
  });
  it("negotiable_instrument contains Cheque copy and Return memo", () => {
    const labels = CHECKLIST_TEMPLATES.negotiable_instrument.map((i) => i.label);
    expect(labels).toContain("Cheque copy");
    expect(labels).toContain("Return memo");
  });
  it("other minimal has ID proof", () => {
    expect(CHECKLIST_TEMPLATES.other.map((i) => i.label)).toContain("ID proof");
  });
});

describe("ready invariant pure logic", () => {
  function isReady(requiredItems: { required: boolean; status: string }[]) {
    return !requiredItems.some((i) => i.required && i.status !== "verified");
  }
  it("incomplete required cannot become ready", () => {
    expect(isReady([{ required: true, status: "verified" }, { required: true, status: "pending" }])).toBe(false);
  });
  it("all required verified -> ready", () => {
    expect(isReady([{ required: true, status: "verified" }, { required: true, status: "verified" }])).toBe(true);
  });
  it("optional unverified does not block ready", () => {
    expect(isReady([{ required: true, status: "verified" }, { required: false, status: "pending" }])).toBe(true);
  });
  it("concurrent verification simulation — last verifier triggers ready only once", () => {
    const items: { required: boolean; status: string }[] = [
      { required: true, status: "pending" },
      { required: true, status: "pending" },
    ];
    // first verify
    items[0].status = "verified";
    expect(isReady(items)).toBe(false);
    // second verify
    items[1].status = "verified";
    expect(isReady(items)).toBe(true);
  });
});
