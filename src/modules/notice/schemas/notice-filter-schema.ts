import { z } from "zod";

export const noticeFilterSchema = z.object({
  q: z.string().trim().max(100).optional(),
  status: z.enum(["received","review","assigned","awaiting_client","drafting","internal_review","ready_to_submit","submitted","follow_up","closed"]).optional(),
  priority: z.enum(["low","medium","high","urgent"]).optional(),
  authority: z.enum(["income_tax","gst","tds","other"]).optional(),
  assigned: z.string().optional(), // my | unassigned | uuid
  deadline: z.enum(["all","overdue","today","due_7"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
});

export type NoticeFilterInput = z.infer<typeof noticeFilterSchema>;

export function parseNoticeFilters(searchParams: Record<string, string | string[] | undefined>): NoticeFilterInput {
  const raw: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(searchParams)) {
    raw[k] = Array.isArray(v) ? v[0] : v;
  }
  // validate, ignore invalid enums → default to undefined, page defaults to 1
  const parsed = noticeFilterSchema.safeParse(raw);
  if (!parsed.success) {
    const clean: NoticeFilterInput = { page: 1 };
    if (typeof raw.q === "string" && raw.q.trim().length > 0) clean.q = raw.q.trim().slice(0, 100);
    return clean;
  }
  return parsed.data;
}
