import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Client } from "../types/client-types";
import { archiveClientAction } from "../actions/archive-client";

export function ClientsTable({ clients }: { clients: Client[] }) {
  if (clients.length === 0) {
    return (
      <div className="rounded-md border p-6 text-center">
        <p className="text-sm text-muted-foreground">No clients yet. Clients support notice workflow.</p>
        <Link href="/app/clients/new" className="mt-3 inline-flex rounded-md border px-3 py-1 text-sm">
          New client
        </Link>
      </div>
    );
  }
  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-full min-w-[640px] text-sm">
        <thead className="bg-muted/50 text-left">
          <tr>
            <th className="p-3">Name</th>
            <th className="p-3">Email</th>
            <th className="p-3">Phone</th>
            <th className="p-3">Archived</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((c) => (
            <tr key={c.id} className="border-t">
              <td className="p-3">{c.name}</td>
              <td className="p-3">{c.email ?? "—"}</td>
              <td className="p-3">{c.phone ?? "—"}</td>
              <td className="p-3">{c.is_archived ? <Badge variant="outline">archived</Badge> : "—"}</td>
              <td className="p-3 flex gap-2">
                <Link href={`/app/clients/${c.id}/edit`} className="text-sm underline">
                  Edit
                </Link>
                <form action={archiveClientAction}>
                  <input type="hidden" name="id" value={c.id} />
                  <input type="hidden" name="is_archived" value={c.is_archived ? "false" : "true"} />
                  <Button size="sm" variant="outline" type="submit">
                    {c.is_archived ? "Unarchive" : "Archive"}
                  </Button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
