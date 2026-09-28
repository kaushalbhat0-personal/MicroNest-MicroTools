import type { FirmRole } from "../constants/firm-constants";

/**
 * Explicit, server-side permission helpers.
 * All checks derive from authenticated user + firm_members row — never client role.
 */

export function isOwner(role: FirmRole | null | undefined): boolean {
  return role === "owner";
}

export function isAdmin(role: FirmRole | null | undefined): boolean {
  return role === "admin";
}

export function isOwnerOrAdmin(role: FirmRole | null | undefined): boolean {
  return role === "owner" || role === "admin";
}

export function canManageMembers(role: FirmRole | null | undefined): boolean {
  // Phase 1: only owner/admin may manage members; member cannot self-promote
  return isOwnerOrAdmin(role);
}

export function canAccessFirm(role: FirmRole | null | undefined): boolean {
  return role === "owner" || role === "admin" || role === "member";
}

export function canCreateFirm(existingFirmCount: number): boolean {
  // Phase 1 single-firm: user with 0 firms may create one
  return existingFirmCount === 0;
}
