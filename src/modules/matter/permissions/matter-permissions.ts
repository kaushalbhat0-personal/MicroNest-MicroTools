import type { FirmRole } from "@/modules/firm/constants/firm-constants";

export function canViewMatters(role: FirmRole | null | undefined): boolean {
  return role === "owner" || role === "admin" || role === "member";
}

export function canCreateMatter(role: FirmRole | null | undefined): boolean {
  return role === "owner" || role === "admin";
}

export function canEditMatter(
  role: FirmRole | null | undefined,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _actorUserId: string | null,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _matterAssignedTo: string | null,
): boolean {
  if (role === "owner" || role === "admin") return true;
  // MEMBER cannot edit arbitrary matter (only maybe limited?) — spec says cannot edit arbitrary matter, so disallow
  return false;
}

export function canUploadToMatter(
  role: FirmRole | null | undefined,
  actorUserId: string | null,
  matterAssignedTo: string | null,
): boolean {
  if (role === "owner" || role === "admin") return true;
  if (role === "member") return matterAssignedTo !== null && matterAssignedTo === actorUserId;
  return false;
}

export function canVerifyChecklist(role: FirmRole | null | undefined): boolean {
  return role === "owner" || role === "admin";
}

export function canRejectChecklist(role: FirmRole | null | undefined): boolean {
  return role === "owner" || role === "admin";
}

export function canArchiveMatter(role: FirmRole | null | undefined): boolean {
  return role === "owner" || role === "admin";
}

export function canMarkReady(role: FirmRole | null | undefined): boolean {
  return role === "owner" || role === "admin";
}

export function canCreateMatterNote(
  role: FirmRole | null | undefined,
  actorUserId: string | null,
  matterAssignedTo: string | null,
): boolean {
  if (role === "owner" || role === "admin") return true;
  if (role === "member") return matterAssignedTo !== null && matterAssignedTo === actorUserId;
  return false;
}

export function canEditMatterNote(
  role: FirmRole | null | undefined,
  actorUserId: string | null,
  matterAssignedTo: string | null,
  noteAuthorId: string | null,
): boolean {
  if (role === "owner" || role === "admin") return true;
  if (role === "member") {
    return matterAssignedTo === actorUserId && noteAuthorId === actorUserId;
  }
  return false;
}

export function canDeleteMatterNote(
  role: FirmRole | null | undefined,
  actorUserId: string | null,
  matterAssignedTo: string | null,
  noteAuthorId: string | null,
): boolean {
  return canEditMatterNote(role, actorUserId, matterAssignedTo, noteAuthorId);
}
