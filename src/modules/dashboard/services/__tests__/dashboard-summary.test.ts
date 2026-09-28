import { describe, expect, it } from "vitest";

function computeSummary(notices: { status: string; response_deadline: string; assigned_to: string | null }[], userId: string, today: string) {
  const in7 = (() => {
    const d = new Date(today + "T00:00:00");
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 10);
  })();
  const open = notices.filter((n) => n.status !== "closed");
  const overdue = open.filter((n) => n.response_deadline < today);
  const dueSoon = open.filter((n) => n.response_deadline >= today && n.response_deadline <= in7);
  const myNotices = open.filter((n) => n.assigned_to === userId);
  return { open: open.length, overdue: overdue.length, dueSoon: dueSoon.length, myNotices: myNotices.length };
}

describe("dashboard summary", () => {
  const today = "2026-09-28";
  const notices = [
    { status: "received", response_deadline: "2026-09-27", assigned_to: "u1" },
    { status: "closed", response_deadline: "2026-09-27", assigned_to: "u1" },
    { status: "drafting", response_deadline: "2026-09-28", assigned_to: "u1" },
    { status: "drafting", response_deadline: "2026-10-02", assigned_to: "u2" },
    { status: "review", response_deadline: "2026-10-10", assigned_to: "u1" },
  ];

  it("open excludes closed", () => {
    expect(computeSummary(notices, "u1", today).open).toBe(4);
  });
  it("overdue correct", () => {
    expect(computeSummary(notices, "u1", today).overdue).toBe(1);
  });
  it("dueSoon correct", () => {
    expect(computeSummary(notices, "u1", today).dueSoon).toBe(2);
  });
  it("my notices uses assigned_to = auth.uid() and excludes closed", () => {
    expect(computeSummary(notices, "u1", today).myNotices).toBe(3);
  });
  it("closed excluded from my notices", () => {
    expect(computeSummary([{ status: "closed", response_deadline: today, assigned_to: "u1" }], "u1", today).myNotices).toBe(0);
  });
  it("empty", () => {
    expect(computeSummary([], "u1", today)).toEqual({ open: 0, overdue: 0, dueSoon: 0, myNotices: 0 });
  });
});
