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

export const professions: Profession[] = [
  {
    slug: "chartered-accountants",
    name: "Chartered Accountants",
    description: "Lightweight tools for Chartered Accountants to manage statutory workflows with clarity.",
    tools: [noticeflow],
  },
];

export const tools: Tool[] = [noticeflow];

export function getProfession(slug: string): Profession | undefined {
  return professions.find((p) => p.slug === slug);
}

export function getTool(slug: string): Tool | undefined {
  return tools.find((t) => t.slug === slug);
}
