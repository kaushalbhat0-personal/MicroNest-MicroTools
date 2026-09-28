import type { MatterType } from "./matter-constants";

export type ChecklistTemplateItem = {
  label: string;
  required: boolean;
};

export const CHECKLIST_TEMPLATES: Record<MatterType, ChecklistTemplateItem[]> = {
  civil: [
    { label: "Vakalatnama", required: true },
    { label: "ID proof", required: true },
    { label: "Agreement", required: true },
    { label: "Payment proof", required: false },
  ],
  criminal: [
    { label: "Vakalatnama", required: true },
    { label: "ID proof", required: true },
    { label: "FIR copy", required: true },
  ],
  negotiable_instrument: [
    { label: "Vakalatnama", required: true },
    { label: "Cheque copy", required: true },
    { label: "Return memo", required: true },
    { label: "ID proof", required: true },
  ],
  rent: [
    { label: "Vakalatnama", required: true },
    { label: "Rent agreement", required: true },
    { label: "ID proof", required: true },
    { label: "Payment receipts", required: false },
  ],
  recovery: [
    { label: "Vakalatnama", required: true },
    { label: "ID proof", required: true },
    { label: "Demand notice", required: true },
    { label: "Ledger statement", required: false },
  ],
  other: [{ label: "ID proof", required: true }],
};

export function getChecklistTemplate(matterType: MatterType): ChecklistTemplateItem[] {
  return CHECKLIST_TEMPLATES[matterType] ?? CHECKLIST_TEMPLATES.other;
}
