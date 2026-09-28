export function deadlineText(deadline: string, today: string): string {
  const d = new Date(deadline + "T00:00:00");
  const t = new Date(today + "T00:00:00");
  const diff = Math.round((d.getTime() - t.getTime()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return `OVERDUE · ${Math.abs(diff)} days late`;
  if (diff === 0) return "DUE TODAY";
  if (diff <= 7) return `DUE IN ${diff} DAYS`;
  return `Due ${deadline}`;
}

export function todayInKolkata(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
}
