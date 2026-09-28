export const NOTICE_AUTHORITIES = ["income_tax", "gst", "tds", "other"] as const;
export type NoticeAuthority = (typeof NOTICE_AUTHORITIES)[number];

export const NOTICE_TYPES = ["scrutiny", "intimation", "demand", "show_cause", "other"] as const;
export type NoticeType = (typeof NOTICE_TYPES)[number];

export const NOTICE_PRIORITIES = ["low", "medium", "high", "urgent"] as const;
export type NoticePriority = (typeof NOTICE_PRIORITIES)[number];

export const NOTICE_STATUSES = [
  "received",
  "review",
  "assigned",
  "awaiting_client",
  "drafting",
  "internal_review",
  "ready_to_submit",
  "submitted",
  "follow_up",
  "closed",
] as const;
export type NoticeStatus = (typeof NOTICE_STATUSES)[number];
