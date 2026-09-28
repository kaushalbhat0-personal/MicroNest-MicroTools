import type { NoticeStatus } from "@/modules/notice/constants/notice-constants";

export type Activity = {
  id: string;
  firm_id: string;
  notice_id: string;
  actor_id: string;
  action: "status_changed";
  from_status: NoticeStatus;
  to_status: NoticeStatus;
  metadata: Record<string, unknown> | null;
  created_at: string;
};
