export type ToolStatus = "available" | "coming_soon";

export type Tool = {
  slug: string;
  name: string;
  description: string;
  profession: string;
  status: ToolStatus;
  href: string;
  appHref: string;
};

export type Profession = {
  slug: string;
  name: string;
  description: string;
  tools: Tool[];
};

const noticeflow: Tool = {
  slug: "noticeflow",
  name: "NoticeFlow",
  description: "Notice workflow management for CA firms. Track GST and income-tax notices from receipt to closure — without spreadsheets.",
  profession: "chartered-accountants",
  status: "available",
  href: "/tools/noticeflow",
  appHref: "/app",
};

const mattervault: Tool = {
  slug: "mattervault",
  name: "MatterVault",
  description: "Client document collection and matter file organization for Indian litigators — from checklist to ready file, without spreadsheets.",
  profession: "lawyers",
  status: "available",
  href: "/tools/mattervault",
  appHref: "/app/matters",
};

export const professions: Profession[] = [
  {
    slug: "chartered-accountants",
    name: "Chartered Accountants",
    description: "Lightweight tools for Chartered Accountants to manage statutory workflows with clarity.",
    tools: [noticeflow],
  },
  {
    slug: "lawyers",
    name: "Lawyers",
    description: "Focused tools for litigators and law firms to organize client document collection and keep matter files ready to file.",
    tools: [mattervault],
  },
];

export const tools: Tool[] = [noticeflow, mattervault];

export function getProfession(slug: string): Profession | undefined {
  return professions.find((p) => p.slug === slug);
}

export function getTool(slug: string): Tool | undefined {
  return tools.find((t) => t.slug === slug);
}
