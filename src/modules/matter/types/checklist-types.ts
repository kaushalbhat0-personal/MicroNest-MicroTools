import type { ChecklistStatus } from "../constants/matter-constants";

export type ChecklistItem = {
  id: string;
  matter_id: string;
  firm_id: string;
  label: string;
  required: boolean;
  status: ChecklistStatus;
  document_id: string | null;
  created_at: string;
  updated_at: string;
};
