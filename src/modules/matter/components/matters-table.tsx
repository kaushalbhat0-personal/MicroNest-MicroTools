import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { Matter } from "../types/matter-types";
import type { Client } from "@/modules/client/types/client-types";

export function MattersTable({
  matters,
  clientsMap,
  readinessMap,
}: {
  matters: Matter[];
  clientsMap: Map<string, Client>;
  readinessMap?: Map<string, { requiredCount: number; verifiedCount: number }>;
}) {
  if (matters.length === 0)
    return (
      <div className="rounded-md border p-6 text-center">
        <p className="text-sm text-muted-foreground">No matters yet. Create your first matter.</p>
        <Link href="/app/matters/new" className="mt-3 inline-flex rounded-md border px-3 py-1 text-sm">
          New matter
        </Link>
      </div>
    );
  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-full min-w-[720px] text-sm">
        <thead className="bg-muted/50 text-left">
          <tr>
            <th className="p-3">Title</th>
            <th className="p-3">Client</th>
            <th className="p-3">Type</th>
            <th className="p-3">Status</th>
            <th className="p-3">Readiness</th>
            <th className="p-3">Assigned</th>
            <th className="p-3">Deadline</th>
          </tr>
        </thead>
        <tbody>
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
              <tr key={m.id} className="border-t">
                <td className="p-3">
                  <Link href={`/app/matters/${m.id}`} className="underline">
                    {m.title}
                  </Link>
                </td>
                <td className="p-3">{clientsMap.get(m.client_id)?.name ?? m.client_id.slice(0, 8)}</td>
                <td className="p-3">{m.matter_type}</td>
                <td className="p-3">
                  <Badge>{m.status}</Badge>
                </td>
                <td className="p-3 text-xs">
                  {readiness === "—" ? (
                    <span className="text-muted-foreground">—</span>
                  ) : readiness.startsWith("Ready") ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700">{readiness}</Badge>
                  ) : (
                    <Badge variant="outline">{readiness}</Badge>
                  )}
                </td>
                <td className="p-3 font-mono text-xs">{m.assigned_to ? m.assigned_to.slice(0, 8) : "—"}</td>
                <td className="p-3">{m.deadline ?? "—"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
