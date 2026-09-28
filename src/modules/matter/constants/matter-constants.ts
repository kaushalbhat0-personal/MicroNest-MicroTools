export const MATTER_TYPES = [
  "civil",
  "criminal",
  "negotiable_instrument",
  "rent",
  "recovery",
  "other",
] as const;
export type MatterType = (typeof MATTER_TYPES)[number];

export const MATTER_STATUSES = ["open", "ready", "archived"] as const;
export type MatterStatus = (typeof MATTER_STATUSES)[number];

export const CHECKLIST_STATUSES = ["pending", "uploaded", "verified", "rejected"] as const;
export type ChecklistStatus = (typeof CHECKLIST_STATUSES)[number];
