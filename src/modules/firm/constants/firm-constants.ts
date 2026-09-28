export const FIRM_ROLES = ["owner", "admin", "member"] as const;
export type FirmRole = (typeof FIRM_ROLES)[number];

export const FIRM_STATUSES = ["active", "suspended"] as const;
export type FirmStatus = (typeof FIRM_STATUSES)[number];
