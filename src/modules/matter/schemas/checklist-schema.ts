import { z } from "zod";
import { CHECKLIST_STATUSES } from "../constants/matter-constants";

export const checklistTransitionSchema = z.object({
  checklistItemId: z.string().uuid(),
  targetStatus: z.enum(CHECKLIST_STATUSES as unknown as [string, ...string[]]),
});

export function isValidChecklistTransition(
  from: (typeof CHECKLIST_STATUSES)[number],
  to: (typeof CHECKLIST_STATUSES)[number],
): boolean {
  const allowed: Record<string, string[]> = {
    pending: ["uploaded"],
    uploaded: ["verified", "rejected"],
    rejected: ["pending", "uploaded"],
    verified: [],
  };
  return (allowed[from] ?? []).includes(to);
}
