import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { TableWrapper, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import type { Notice } from "../types/notice-types";
import type { Client } from "@/modules/client/types/client-types";

export function NoticesTable({ notices, clientsMap }: { notices: Notice[]; clientsMap: Map<string, Client> }) {
  if (notices.length === 0)
    return (
      <EmptyState
        title="No notices match"
        description="Try adjusting search or filters, or create a new notice."
        action={
          <Link href="/app/notices/new" className="inline-flex rounded-md border px-3 py-1 text-sm">
            New notice
          </Link>
        }
      />
    );
  return (
    <TableWrapper>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Client</TableHead>
            <TableHead>Reference</TableHead>
            <TableHead>Authority</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Deadline</TableHead>
            <TableHead>Assigned</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {notices.map((n) => (
            <TableRow key={n.id}>
              <TableCell>{clientsMap.get(n.client_id)?.name ?? n.client_id.slice(0, 8)}</TableCell>
              <TableCell>
                <Link href={`/app/notices/${n.id}`} className="underline">
                  {n.reference_number ?? n.id.slice(0, 8)}
                </Link>
              </TableCell>
              <TableCell>{n.authority}</TableCell>
              <TableCell>{n.notice_type}</TableCell>
              <TableCell>
                <Badge variant="outline">{n.priority}</Badge>
              </TableCell>
              <TableCell>
                <span>
                  {n.response_deadline}{" "}
                  <span className={`text-xs font-medium ${(() => {
                    const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
                    const d = new Date(n.response_deadline + "T00:00:00");
                    const t = new Date(today + "T00:00:00");
                    const diff = Math.round((d.getTime() - t.getTime()) / 86400000);
                    if (diff < 0) return "text-red-600";
                    if (diff === 0) return "text-amber-600";
                    if (diff <= 7) return "text-amber-600";
                    return "text-muted-foreground";
                  })()}`}>
                    {(() => {
                      const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
                      const d = new Date(n.response_deadline + "T00:00:00");
                      const t = new Date(today + "T00:00:00");
                      const diff = Math.round((d.getTime() - t.getTime()) / 86400000);
                      if (diff < 0) return `OVERDUE · ${Math.abs(diff)} days`;
                      if (diff === 0) return "DUE TODAY";
                      if (diff <= 7) return `DUE IN ${diff} DAYS`;
                      return "";
                    })()}
                  </span>
                </span>
              </TableCell>
              <TableCell className="font-mono text-xs">{n.assigned_to ? n.assigned_to.slice(0, 8) : "—"}</TableCell>
              <TableCell>
                <Badge>{n.status}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableWrapper>
  );
}
