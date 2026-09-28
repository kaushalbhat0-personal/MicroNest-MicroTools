import { z } from "zod";

const noticeBaseFields = {
  client_id: z.string().uuid("Invalid client"),
  reference_number: z.string().trim().max(200).optional().or(z.literal("")),
  authority: z.enum(["income_tax", "gst", "tds", "other"]),
  notice_type: z.enum(["scrutiny", "intimation", "demand", "show_cause", "other"]),
  received_date: z.string().optional().or(z.literal("")),
  response_deadline: z.string().min(1, "Deadline is required"),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  assigned_to: z.string().uuid().optional().or(z.literal("")).or(z.null()),
  next_action: z.string().trim().max(500).optional().or(z.literal("")),
  next_action_date: z.string().optional().or(z.literal("")),
};

function deadlineRefine(data: Record<string, unknown>, ctx: z.RefinementCtx) {
  const rec = data.received_date as string | undefined;
  const dl = data.response_deadline as string | undefined;
  if (rec && dl) {
    const r = new Date(rec);
    const d = new Date(dl);
    if (!isNaN(r.getTime()) && !isNaN(d.getTime()) && d < r) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Deadline must not be before received date", path: ["response_deadline"] });
    }
  }
}

export const createNoticeSchema = z.object(noticeBaseFields).superRefine(deadlineRefine);

export const updateNoticeSchema = z.object({ id: z.string().uuid(), ...noticeBaseFields }).superRefine(deadlineRefine);

export type CreateNoticeInput = z.infer<typeof createNoticeSchema>;
export type UpdateNoticeInput = z.infer<typeof updateNoticeSchema>;
