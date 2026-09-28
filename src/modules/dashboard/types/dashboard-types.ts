export type DashboardSummary = {
  open: number;
  overdue: number;
  dueSoon: number;
  myNotices: number;
};

export type AttentionNotice = {
  id: string;
  clientName: string;
  reference_number: string | null;
  priority: string;
  response_deadline: string;
  status: string;
  assigned_to: string | null;
  overdue: boolean;
  dueSoon: boolean;
};
