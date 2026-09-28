import type { FirmRole } from "@/modules/firm/constants/firm-constants";

export function canViewDocuments(role: FirmRole | null | undefined): boolean {
  return role === "owner" || role === "admin" || role === "member";
}

export function canUploadDocument(
  role: FirmRole | null | undefined,
  actorUserId: string | null,
  noticeAssignedTo: string | null,
): boolean {
  if (role === "owner" || role === "admin") return true;
  if (role === "member") return noticeAssignedTo !== null && noticeAssignedTo === actorUserId;
  return false;
}

export function canDeleteDocument(role: FirmRole | null | undefined): boolean {
  return role === "owner" || role === "admin";
}
