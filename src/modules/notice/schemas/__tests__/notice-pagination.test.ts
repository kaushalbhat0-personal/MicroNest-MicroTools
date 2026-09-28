import { describe, expect, it } from "vitest";
import { parseNoticeFilters } from "../notice-filter-schema";

describe("pagination schema", () => {
  it("defaults to 1", () => {
    expect(parseNoticeFilters({}).page).toBe(1);
    expect(parseNoticeFilters({ page: "1" }).page).toBe(1);
  });
  it("page 0 normalizes — defaults to 1", () => {
    const r = parseNoticeFilters({ page: "0" } as never);
    expect(r.page).toBe(1);
  });
  it("invalid page handled safely — defaults to 1", () => {
    expect(parseNoticeFilters({ page: "abc" } as never).page).toBe(1);
    expect(parseNoticeFilters({ page: "-5" } as never).page).toBe(1);
  });
  it("does not accept firm_id", () => {
    const r = parseNoticeFilters({ firm_id: "evil" } as never);
    expect((r as Record<string, unknown>).firm_id).toBeUndefined();
  });
  it("filters + page together", () => {
    const r = parseNoticeFilters({ q: "abc", status: "review", page: "2" });
    expect(r.q).toBe("abc");
    expect(r.status).toBe("review");
    expect(r.page).toBe(2);
  });
});
