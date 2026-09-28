import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export function AttentionList({
  notices,
}: {
  notices: { id: string; clientName: string; reference_number: string | null; priority: string; response_deadline: string; status: string; overdue: boolean; dueSoon: boolean }[];
}) {
  if (notices.length === 0) return <p className="text-sm text-muted-foreground">No attention items.</p>;
  return (
    <ul className="space-y-2">
      {notices.map((n) => (
        <li key={n.id} className="flex items-center justify-between rounded-md border p-3 text-sm">
          <div>
            <p className="font-medium">
              <Link href={`/app/notices/${n.id}`} className="underline">
                {n.reference_number ?? n.id.slice(0, 8)}
              </Link>{" "}
              — {n.clientName}
            </p>
            <p className="text-xs text-muted-foreground">
              {n.status} • due {n.response_deadline} {n.overdue ? "(overdue)" : n.dueSoon ? "(due soon)" : ""}
            </p>
          </div>
          <Badge variant="outline">{n.priority}</Badge>
        </li>
      ))}
    </ul>
  );
}
