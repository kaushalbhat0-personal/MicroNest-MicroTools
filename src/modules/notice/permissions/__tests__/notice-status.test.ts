import { describe, expect, it } from "vitest";
import { canTransition } from "../notice-status";
import type { NoticeStatus } from "../../constants/notice-constants";

const owner = { role: "owner" as const, actorUserId: "owner-id", noticeAssignedTo: "owner-id", targetAssignedTo: null };
const memberOwn = { role: "member" as const, actorUserId: "member-id", noticeAssignedTo: "member-id", targetAssignedTo: null };
const memberOther = { role: "member" as const, actorUserId: "member-id", noticeAssignedTo: "other-id", targetAssignedTo: null };

describe("canTransition", () => {
  const valids: [NoticeStatus, NoticeStatus][] = [
    ["received", "review"],
    ["review", "assigned"],
    ["review", "drafting"],
    ["assigned", "awaiting_client"],
    ["assigned", "drafting"],
    ["awaiting_client", "drafting"],
    ["drafting", "internal_review"],
    ["internal_review", "drafting"],
    ["internal_review", "ready_to_submit"],
    ["ready_to_submit", "submitted"],
    ["submitted", "follow_up"],
    ["follow_up", "closed"],
    ["closed", "review"],
  ];

  for (const [from, to] of valids) {
    it(`allows ${from} -> ${to} for owner`, () => {
      // for review->assigned need target
      const ctx = { ...owner, targetAssignedTo: to === "assigned" ? "some-user" : null };
      expect(canTransition(from, to, ctx as never).allowed).toBe(true);
    });
  }

  const invalids: [NoticeStatus, NoticeStatus][] = [
    ["received", "drafting"],
    ["received", "closed"],
    ["review", "internal_review"],
    ["assigned", "ready_to_submit"],
    ["drafting", "submitted"],
    ["closed", "drafting"],
  ];
  for (const [from, to] of invalids) {
    it(`rejects ${from} -> ${to}`, () => {
      expect(canTransition(from, to, owner as never).allowed).toBe(false);
    });
  }

  it("member can REVIEW->DRAFTING when assigned to self", () => {
    expect(canTransition("review", "drafting", memberOwn as never).allowed).toBe(true);
  });
  it("member cannot REVIEW->DRAFTING when unassigned or other", () => {
    expect(canTransition("review", "drafting", memberOther as never).allowed).toBe(false);
    expect(canTransition("review", "drafting", { role: "member", actorUserId: "member-id", noticeAssignedTo: null, targetAssignedTo: null } as never).allowed).toBe(false);
  });
  it("member cannot REVIEW->ASSIGNED", () => {
    expect(canTransition("review", "assigned", { role: "member", actorUserId: "member-id", noticeAssignedTo: "member-id", targetAssignedTo: "member-id" } as never).allowed).toBe(false);
  });
  it("member cannot INTERNAL_REVIEW->READY_TO_SUBMIT", () => {
    expect(canTransition("internal_review", "ready_to_submit", memberOwn as never).allowed).toBe(false);
  });
  it("member cannot SUBMITTED etc", () => {
    expect(canTransition("ready_to_submit", "submitted", memberOwn as never).allowed).toBe(false);
  });
  it("member cannot reopen CLOSED", () => {
    expect(canTransition("closed", "review", memberOwn as never).allowed).toBe(false);
  });
  it("member cannot assign to another", () => {
    expect(canTransition("review", "assigned", { role: "member", actorUserId: "member-id", noticeAssignedTo: "member-id", targetAssignedTo: "other-id" } as never).allowed).toBe(false);
  });
  it("REVIEW->ASSIGNED requires target", () => {
    expect(canTransition("review", "assigned", { role: "owner", actorUserId: "x", noticeAssignedTo: null, targetAssignedTo: null } as never).allowed).toBe(false);
  });
});
