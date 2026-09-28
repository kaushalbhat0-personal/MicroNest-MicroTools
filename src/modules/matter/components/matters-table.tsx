import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { TableWrapper, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import type { Matter } from "../types/matter-types";
import type { Client } from "@/modules/client/types/client-types";

export function MattersTable({
  matters,
  clientsMap,
  readinessMap,
  membersMap,
}: {
  matters: Matter[];
  clientsMap: Map<string, Client>;
  readinessMap?: Map<string, { requiredCount: number; verifiedCount: number }>;
  membersMap?: Map<string, string>;
}) {
  if (matters.length === 0)
    return (
      <EmptyState
        title="No matters yet"
        description="Create your first matter to start tracking."
        action={
          <Link href="/app/matters/new" className="inline-flex rounded-md border px-3 py-1 text-sm">
            New matter
          </Link>
        }
      />
    );
  return (
    <TableWrapper>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Readiness</TableHead>
            <TableHead>Assigned</TableHead>
            <TableHead>Deadline</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {matters.map((m) => {
            const r = readinessMap?.get(m.id);
            let readiness: string = "—";
            if (r) {
              if (r.requiredCount === 0) readiness = "—";
              else if (m.status === "ready") readiness = `Ready ${r.verifiedCount}/${r.requiredCount}`;
              else if (r.verifiedCount === r.requiredCount) readiness = `Ready ${r.verifiedCount}/${r.requiredCount}`;
              else readiness = `Required: ${r.verifiedCount}/${r.requiredCount}`;
            }
            return (
              <TableRow key={m.id}>
                <TableCell>
                  <Link href={`/app/matters/${m.id}`} className="underline">
                    {m.title}
                  </Link>
                </TableCell>
                <TableCell>{clientsMap.get(m.client_id)?.name ?? m.client_id.slice(0, 8)}</TableCell>
                <TableCell>{m.matter_type}</TableCell>
                <TableCell>
                  <Badge>{m.status}</Badge>
                </TableCell>
                <TableCell className="text-xs">
                  {readiness === "—" ? (
                    <span className="text-muted-foreground">—</span>
                  ) : readiness.startsWith("Ready") ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700">{readiness}</Badge>
                  ) : (
                    <Badge variant="outline">{readiness}</Badge>
                  )}
                </TableCell>
                <TableCell className="text-sm">{m.assigned_to ? (membersMap?.get(m.assigned_to) ?? m.assigned_to.slice(0, 8)) : "—"}</TableCell>
                <TableCell>
                  {m.deadline ? (
                    <span>
                      {m.deadline}{" "}
                      <span className={`text-xs font-medium ${(() => {
                        const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
                        const d = new Date(m.deadline! + "T00:00:00");
                        const t = new Date(today + "T00:00:00");
                        const diff = Math.round((d.getTime() - t.getTime()) / 86400000);
                        if (diff < 0) return "text-red-600";
                        if (diff === 0) return "text-amber-600";
                        if (diff <= 7) return "text-amber-600";
                        return "text-muted-foreground";
                      })()}`}>
                        {(() => {
                          const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
                          const d = new Date(m.deadline! + "T00:00:00");
                          const t = new Date(today + "T00:00:00");
                          const diff = Math.round((d.getTime() - t.getTime()) / 86400000);
                          if (diff < 0) return `OVERDUE · ${Math.abs(diff)} days late`;
                          if (diff === 0) return "DUE TODAY";
                          if (diff <= 7) return `DUE IN ${diff} DAYS`;
                          return "";
                        })()}
                      </span>
                    </span>
                  ) : (
                    "—"
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableWrapper>
  );
}
