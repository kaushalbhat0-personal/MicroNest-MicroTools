import type { FirmRole, FirmStatus } from "../constants/firm-constants";

export type Firm = {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  status: FirmStatus;
  country: string;
  currency: string;
  locale: string;
  timezone: string;
  created_at: string;
  updated_at: string;
};

export type FirmMember = {
  id: string;
  firm_id: string;
  user_id: string;
  role: FirmRole;
  invited_at: string | null;
  joined_at: string;
  created_at: string;
};

export type AppUser = {
  id: string;
  email: string;
  name: string | null;
  created_at: string;
  updated_at: string;
};
