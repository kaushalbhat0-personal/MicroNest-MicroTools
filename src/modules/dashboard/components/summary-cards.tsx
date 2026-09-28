export function SummaryCards({ summary }: { summary: { open: number; overdue: number; dueSoon: number; myNotices: number } }) {
  const cards = [
    { label: "Open", value: summary.open },
    { label: "Overdue", value: summary.overdue },
    { label: "Due Soon (7d)", value: summary.dueSoon },
    { label: "My Notices", value: summary.myNotices },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {cards.map((c) => {
        const isOverdue = c.label === "Overdue" && c.value > 0;
        const isDueSoon = c.label === "Due Soon (7d)" && c.value > 0;
        return (
          <div
            key={c.label}
            className={`rounded-md border p-4 ${isOverdue ? "border-red-200 bg-red-50 dark:bg-red-950/20" : isDueSoon ? "border-amber-200 bg-amber-50 dark:bg-amber-950/20" : ""}`}
          >
            <p className="text-sm text-muted-foreground">{c.label}</p>
            <p className="text-2xl font-semibold" aria-label={`${c.label} ${c.value}`}>
              {c.value}
            </p>
            {isOverdue && <p className="text-xs text-red-700 dark:text-red-300">Needs action</p>}
          </div>
        );
      })}
    </div>
  );
}
