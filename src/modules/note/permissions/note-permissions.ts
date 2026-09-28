import type { FirmRole } from "@/modules/firm/constants/firm-constants";

export function canViewNotes(role: FirmRole | null | undefined): boolean {
  return role === "owner" || role === "admin" || role === "member";
}

export function canCreateNote(
  role: FirmRole | null | undefined,
  actorUserId: string | null,
  noticeAssignedTo: string | null,
): boolean {
  if (role === "owner" || role === "admin") return true;
  if (role === "member") return noticeAssignedTo !== null && noticeAssignedTo === actorUserId;
  return false;
}

export function canEditNote(
  role: FirmRole | null | undefined,
  actorUserId: string | null,
  noticeAssignedTo: string | null,
  noteAuthorId: string | null,
): boolean {
  if (role === "owner" || role === "admin") return true;
  if (role === "member") {
    return noticeAssignedTo === actorUserId && noteAuthorId === actorUserId;
  }
  return false;
}

export function canDeleteNote(
  role: FirmRole | null | undefined,
  actorUserId: string | null,
  noticeAssignedTo: string | null,
  noteAuthorId: string | null,
): boolean {
  return canEditNote(role, actorUserId, noticeAssignedTo, noteAuthorId);
}
