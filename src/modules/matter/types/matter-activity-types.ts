import type { MatterStatus } from "../constants/matter-constants";

export type MatterActivityAction =
  | "matter_created"
  | "checklist_issued"
  | "document_uploaded"
  | "document_verified"
  | "note_added"
  | "matter_ready"
  | "matter_archived";

export type MatterActivity = {
  id: string;
  firm_id: string;
  matter_id: string;
  actor_id: string;
  action: MatterActivityAction;
  from_status: MatterStatus | null;
  to_status: MatterStatus | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};
