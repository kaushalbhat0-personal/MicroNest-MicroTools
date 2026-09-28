"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { updateMemberRoleAction, type UpdateMemberRoleState } from "../actions/update-member-role";

export function MemberRoleForm({ memberId, currentRole }: { memberId: string; currentRole: string }) {
  const [state, formAction, pending] = useActionState(updateMemberRoleAction, {} as UpdateMemberRoleState);
  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="memberId" value={memberId} />
      <select name="role" defaultValue={currentRole} className="rounded-md border px-2 py-1 text-sm">
        <option value="member">member</option>
        <option value="admin">admin</option>
      </select>
      <Button size="sm" type="submit" disabled={pending}>
        Save
      </Button>
      {state?.error && <span className="text-xs text-red-600">{state.error}</span>}
    </form>
  );
}
