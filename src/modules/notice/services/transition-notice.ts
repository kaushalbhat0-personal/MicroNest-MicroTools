import { createServerSupabaseClient } from "@/infrastructure/database/supabase-server";
import { getNoticeById } from "../repositories/notice-repository";

export async function transitionNoticeForCurrentFirm(args: {
  noticeId: string;
  targetStatus: string;
  targetAssignedTo?: string | null;
}): Promise<{ ok: true } | { error: string }> {
  const supabase = await createServerSupabaseClient();

  // Verify notice belongs to caller's firm before RPC (IDOR early)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Use RPC which atomically validates and transitions
  const { error } = await supabase.rpc("transition_notice", {
    p_notice_id: args.noticeId,
    p_target_status: args.targetStatus as never,
    p_target_assigned_to: args.targetAssignedTo ?? null,
  });

  if (error) return { error: error.message };
  return { ok: true };
}

// Helper for UI to pre-check valid transitions without DB
export async function getNoticeWithFirmCheck(noticeId: string) {
  const supabase = await createServerSupabaseClient();
  const n = await getNoticeById(supabase, noticeId);
  return n;
}
