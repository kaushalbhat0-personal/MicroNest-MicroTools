export type Client = {
  id: string;
  firm_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: Record<string, unknown> | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
};
