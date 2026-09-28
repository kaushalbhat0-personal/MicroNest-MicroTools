import Link from "next/link";
import { listClientsForCurrentFirm } from "@/modules/client/services/list-clients";
import { ClientsTable } from "@/modules/client/components/clients-table";
import { PageHeader } from "@/components/layout/page-header";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const clients = await listClientsForCurrentFirm();
  return (
    <main className="mx-auto max-w-5xl space-y-6 p-6">
      <PageHeader
        title="Clients"
        action={
          <Link href="/app/clients/new" className="rounded-md border px-3 py-1 text-sm">
            New client
          </Link>
        }
      />
      <ClientsTable clients={clients} />
    </main>
  );
}
