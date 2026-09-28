import type { NoticeStatus } from "../constants/notice-constants";
import type { FirmRole } from "@/modules/firm/constants/firm-constants";

export type TransitionContext = {
  role: FirmRole | null | undefined;
  actorUserId: string | null;
  noticeAssignedTo: string | null;
  targetAssignedTo: string | null;
};

const validTransitions: Record<NoticeStatus, NoticeStatus[]> = {
  received: ["review"],
  review: ["assigned", "drafting"],
  assigned: ["awaiting_client", "drafting"],
  awaiting_client: ["drafting"],
  drafting: ["internal_review"],
  internal_review: ["drafting", "ready_to_submit"],
  ready_to_submit: ["submitted"],
  submitted: ["follow_up"],
  follow_up: ["closed"],
  closed: ["review"],
};

/**
 * Pure deterministic transition check — no DB, no side effects.
 */
export function canTransition(
  from: NoticeStatus,
  to: NoticeStatus,
  ctx: TransitionContext,
): { allowed: boolean; reason?: string } {
  const allowedNext = validTransitions[from] ?? [];
  if (!allowedNext.includes(to)) return { allowed: false, reason: `Invalid ${from} -> ${to}` };

  const { role, actorUserId, noticeAssignedTo, targetAssignedTo } = ctx;

  if (!role) return { allowed: false, reason: "No role" };

  // REVIEW -> ASSIGNED requires target assigned_to
  if (from === "review" && to === "assigned" && !targetAssignedTo) {
    return { allowed: false, reason: "assigned_to required" };
  }

  // MEMBER checks — must be assigned to self
  if (role === "member") {
    if (noticeAssignedTo !== actorUserId) {
      return { allowed: false, reason: "Member only own assigned" };
    }
    if (["ready_to_submit", "submitted", "follow_up", "closed"].includes(to)) {
      return { allowed: false, reason: "Member not allowed for " + to };
    }
    if (from === "closed" && to === "review") {
      return { allowed: false, reason: "Member cannot reopen" };
    }
    if (from === "review" && to === "assigned") {
      return { allowed: false, reason: "Member cannot assign" };
    }
    if (targetAssignedTo && targetAssignedTo !== actorUserId) {
      return { allowed: false, reason: "Member cannot assign to another" };
    }
  }

  // OWNER/ADMIN privileged
  if (["ready_to_submit", "submitted", "follow_up", "closed"].includes(to) && role === "member") {
    return { allowed: false, reason: "Only owner/admin" };
  }
  if (from === "closed" && to === "review" && role === "member") {
    return { allowed: false, reason: "Only owner/admin can reopen" };
  }

  return { allowed: true };
}

export function getValidNextStatuses(from: NoticeStatus, ctx: TransitionContext): NoticeStatus[] {
  return (validTransitions[from] ?? []).filter((to) => canTransition(from, to, ctx).allowed);
}
