import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { Notice } from "../types/notice-types";
import type { Client } from "@/modules/client/types/client-types";

export function NoticesTable({ notices, clientsMap }: { notices: Notice[]; clientsMap: Map<string, Client> }) {
  if (notices.length === 0)
    return (
      <div className="rounded-md border p-6 text-center">
        <p className="text-sm text-muted-foreground">No notices match. Try adjusting search or filters, or create a new notice.</p>
        <Link href="/app/notices/new" className="mt-3 inline-flex rounded-md border px-3 py-1 text-sm">
          New notice
        </Link>
      </div>
    );
  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-full min-w-[720px] text-sm">
        <thead className="bg-muted/50 text-left">
          <tr>
            <th className="p-3">Client</th>
            <th className="p-3">Reference</th>
            <th className="p-3">Authority</th>
            <th className="p-3">Type</th>
            <th className="p-3">Priority</th>
            <th className="p-3">Deadline</th>
            <th className="p-3">Assigned</th>
            <th className="p-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {notices.map((n) => (
            <tr key={n.id} className="border-t">
              <td className="p-3">{clientsMap.get(n.client_id)?.name ?? n.client_id.slice(0, 8)}</td>
              <td className="p-3">
                <Link href={`/app/notices/${n.id}`} className="underline">
                  {n.reference_number ?? n.id.slice(0, 8)}
                </Link>
              </td>
              <td className="p-3">{n.authority}</td>
              <td className="p-3">{n.notice_type}</td>
              <td className="p-3">
                <Badge variant="outline">{n.priority}</Badge>
              </td>
              <td className="p-3">{n.response_deadline}</td>
              <td className="p-3 font-mono text-xs">{n.assigned_to ? n.assigned_to.slice(0, 8) : "—"}</td>
              <td className="p-3">
                <Badge>{n.status}</Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
