"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { transitionNoticeAction, type TransitionState } from "../actions/transition-notice";
import { getValidNextStatuses } from "../permissions/notice-status";
import type { NoticeStatus } from "../constants/notice-constants";
import type { FirmRole } from "@/modules/firm/constants/firm-constants";
import { useState } from "react";

export function WorkflowControl({
  noticeId,
  currentStatus,
  currentAssignedTo,
  role,
  actorUserId,
  members,
}: {
  noticeId: string;
  currentStatus: NoticeStatus;
  currentAssignedTo: string | null;
  role: FirmRole | null | undefined;
  actorUserId: string | null;
  members: { user_id: string; role: string }[];
}) {
  const [selectedStatus, setSelectedStatus] = useState<NoticeStatus | "">("");
  const [targetAssignee, setTargetAssignee] = useState<string>("");

  const valid = getValidNextStatuses(currentStatus, {
    role: role as never,
    actorUserId,
    noticeAssignedTo: currentAssignedTo,
    targetAssignedTo: targetAssignee || null,
  });

  const [state, formAction, pending] = useActionState(transitionNoticeAction, {} as TransitionState);

  const needsAssignee = currentStatus === "review" && selectedStatus === "assigned";

  return (
    <div className="space-y-3 rounded-md border p-4">
      <p className="text-sm">
        Current: <span className="font-medium">{currentStatus}</span>
      </p>
      <form action={formAction} className="space-y-3">
        <input type="hidden" name="noticeId" value={noticeId} />
        {needsAssignee && <input type="hidden" name="targetAssignedTo" value={targetAssignee} />}
        {!needsAssignee && targetAssignee && <input type="hidden" name="targetAssignedTo" value={targetAssignee} />}
        <div className="space-y-1">
          <label className="text-sm font-medium">Next status</label>
          <select
            name="targetStatus"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as NoticeStatus)}
            className="w-full rounded-md border px-3 py-2 text-sm"
          >
            <option value="">Select transition</option>
            {valid.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-sm">Assign to (if required)</label>
          <select value={targetAssignee} onChange={(e) => setTargetAssignee(e.target.value)} className="w-full rounded-md border px-3 py-2 text-sm">
            <option value="">Keep current</option>
            {members.map((m) => (
              <option key={m.user_id} value={m.user_id}>
                {m.user_id.slice(0, 8)} — {m.role}
              </option>
            ))}
          </select>
        </div>

        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
        {state?.ok && <p className="text-sm text-green-600">Transitioned</p>}
        <Button type="submit" disabled={pending || !selectedStatus}>
          {pending ? "Please wait..." : "Transition"}
        </Button>
      </form>
    </div>
  );
}
