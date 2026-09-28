import type { MatterType, MatterStatus } from "../constants/matter-constants";

export type Matter = {
  id: string;
  firm_id: string;
  client_id: string;
  title: string;
  matter_type: MatterType;
  status: MatterStatus;
  assigned_to: string | null;
  next_action: string | null;
  next_action_date: string | null;
  deadline: string | null;
  created_at: string;
  updated_at: string;
};
