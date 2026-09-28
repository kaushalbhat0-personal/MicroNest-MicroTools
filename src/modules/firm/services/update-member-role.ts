import { createServerSupabaseClient } from "@/infrastructure/database/supabase-server";
import { updateMemberRoleSchema } from "../schemas/member-schema";
import { canUpdateRole } from "../permissions/member-permissions";
import { getCurrentFirmForSession } from "./get-current-firm";
import { updateMemberRole } from "../repositories/firm-repository";

/**
 * Updates a member's role within the caller's firm.
 * - Validates input via Zod
 * - Derives firm and actor role from auth + firm_members (never client)
 * - Verifies target belongs to same firm
 * - Enforces owner/admin and transition rules via permission module
 */
export async function updateMemberRoleForCurrentFirm(raw: unknown): Promise<{ ok: true } | { error: string; fieldErrors?: Record<string, string[]> }> {
  const parsed = updateMemberRoleSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Fix validation errors", fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const { user, firm } = await getCurrentFirmForSession();
  if (!user) return { error: "Not authenticated" };
  if (!firm) return { error: "No firm" };

  const supabase = await createServerSupabaseClient();

  // Actor role
  const { data: actor } = await supabase
    .from("firm_members")
    .select("role")
    .eq("firm_id", firm.id)
    .eq("user_id", user.id)
    .maybeSingle();
  const actorRole = (actor?.role as string | undefined) ?? null;

  // Target member (must be in same firm — prevents cross-firm)
  const { data: target } = await supabase
    .from("firm_members")
    .select("id, role, firm_id")
    .eq("id", parsed.data.memberId)
    .maybeSingle();

  if (!target || target.firm_id !== firm.id) {
    return { error: "Member not found in your firm" };
  }

  const check = canUpdateRole({
    actorRole: actorRole as never,
    targetRole: target.role as never,
    newRole: parsed.data.role as never,
  });
  if (!check.allowed) return { error: check.reason ?? "Not allowed" };

  try {
    await updateMemberRole(supabase, parsed.data.memberId, parsed.data.role);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to update role";
    return { error: msg };
  }

  return { ok: true };
}
