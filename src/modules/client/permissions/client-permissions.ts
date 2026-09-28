import type { FirmRole } from "@/modules/firm/constants/firm-constants";

// Narrowest: view any member, mutate only owner/admin
// Documented decision: MEMBER view-only for client mutations to keep lightweight boundary
export function canViewClients(role: FirmRole | null | undefined): boolean {
  return role === "owner" || role === "admin" || role === "member";
}

export function canMutateClients(role: FirmRole | null | undefined): boolean {
  return role === "owner" || role === "admin";
}
