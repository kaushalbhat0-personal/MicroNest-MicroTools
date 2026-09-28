import type { NoticeAuthority, NoticePriority, NoticeStatus, NoticeType } from "../constants/notice-constants";

export type Notice = {
  id: string;
  firm_id: string;
  client_id: string;
  reference_number: string | null;
  authority: NoticeAuthority;
  notice_type: NoticeType;
  received_date: string | null;
  response_deadline: string;
  priority: NoticePriority;
  assigned_to: string | null;
  status: NoticeStatus;
  next_action: string | null;
  next_action_date: string | null;
  created_at: string;
  updated_at: string;
};
