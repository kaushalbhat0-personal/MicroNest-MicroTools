import { describe, expect, it } from "vitest";
import { parseNoticeFilters } from "../notice-filter-schema";

describe("notice filter parsing", () => {
  it("valid enums", () => {
    expect(parseNoticeFilters({ status: "drafting", priority: "urgent", authority: "gst", deadline: "overdue" }).status).toBe("drafting");
  });
  it("invalid enums ignored", () => {
    expect(parseNoticeFilters({ status: "weird" } as never).status).toBeUndefined();
  });
  it("q trimmed", () => {
    expect(parseNoticeFilters({ q: "  abc  " }).q).toBe("abc");
  });
  it("assigned my/unassigned/uuid", () => {
    expect(parseNoticeFilters({ assigned: "my" }).assigned).toBe("my");
    expect(parseNoticeFilters({ assigned: "unassigned" }).assigned).toBe("unassigned");
    expect(parseNoticeFilters({ assigned: "00000000-0000-4000-a000-000000000000" }).assigned).toBe("00000000-0000-4000-a000-000000000000");
  });
});
