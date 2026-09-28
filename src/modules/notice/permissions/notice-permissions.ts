import type { FirmRole } from "@/modules/firm/constants/firm-constants";

export function canViewNotices(role: FirmRole | null | undefined): boolean {
  return role === "owner" || role === "admin" || role === "member";
}

export function canCreateNotice(role: FirmRole | null | undefined): boolean {
  return role === "owner" || role === "admin" || role === "member";
}

export function canEditNotice(
  role: FirmRole | null | undefined,
  actorUserId: string | null,
  noticeAssignedTo: string | null,
): boolean {
  if (role === "owner" || role === "admin") return true;
  if (role === "member") return noticeAssignedTo !== null && noticeAssignedTo === actorUserId;
  return false;
}

export function canAssignNotice(role: FirmRole | null | undefined): boolean {
  return role === "owner" || role === "admin";
}

// MEMBER may create assigned to self or unassigned only; OWNER/ADMIN may assign any member
export function canSetAssignedTo(
  actorRole: FirmRole | null | undefined,
  actorUserId: string | null,
  assignedTo: string | null,
): boolean {
  if (!assignedTo) return true; // unassigned always allowed
  if (actorRole === "owner" || actorRole === "admin") return true;
  if (actorRole === "member") return assignedTo === actorUserId;
  return false;
}
