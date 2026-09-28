import Link from "next/link";
import { listClientsForCurrentFirm } from "@/modules/client/services/list-clients";
import { ClientsTable } from "@/modules/client/components/clients-table";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const clients = await listClientsForCurrentFirm();
  return (
    <main className="mx-auto max-w-3xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Clients</h1>
        <Link href="/app/clients/new" className="rounded-md border px-3 py-1 text-sm">
          New client
        </Link>
      </div>
      <ClientsTable clients={clients} />
    </main>
  );
}
