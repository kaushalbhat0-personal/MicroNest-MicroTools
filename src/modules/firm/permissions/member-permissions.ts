import type { FirmRole } from "../constants/firm-constants";

/**
 * Who may update a member's role.
 * - Only owner/admin may manage members (firm-permissions: canManageMembers).
 * - Owner role is immutable in Phase 1B: cannot change owner's role, cannot promote to owner.
 * - Allowed: member ↔ admin transitions by owner/admin, within same firm.
 */
export function canUpdateRole(params: {
  actorRole: FirmRole | null | undefined;
  targetRole: FirmRole | null | undefined;
  newRole: FirmRole;
}): { allowed: boolean; reason?: string } {
  const { actorRole, targetRole, newRole } = params;

  if (actorRole !== "owner" && actorRole !== "admin") {
    return { allowed: false, reason: "Only owner or admin may manage members" };
  }
  if (targetRole === "owner") {
    return { allowed: false, reason: "Owner role cannot be changed in Phase 1B" };
  }
  if (newRole === "owner") {
    return { allowed: false, reason: "Cannot promote to owner" };
  }
  if (newRole !== "member" && newRole !== "admin") {
    return { allowed: false, reason: "Invalid role" };
  }
  if (targetRole === newRole) {
    return { allowed: false, reason: "No change" };
  }
  return { allowed: true };
}
