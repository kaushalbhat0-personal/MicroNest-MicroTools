import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/infrastructure/database/supabase-server";
import { getCurrentFirmForSession } from "@/modules/firm/services/get-current-firm";
import { getClientById } from "@/modules/client/repositories/client-repository";
import { ClientForm } from "@/modules/client/components/client-form";
import { updateClientAction } from "@/modules/client/actions/update-client";

export const dynamic = "force-dynamic";

export default async function EditClientPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params;
  const { firm } = await getCurrentFirmForSession();
  if (!firm) notFound();
  const supabase = await createServerSupabaseClient();
  const client = await getClientById(supabase, clientId);
  if (!client || client.firm_id !== firm.id) notFound();

  const addr = (client.address as Record<string, string> | null) ?? {};
  return (
    <main className="mx-auto max-w-md space-y-6 p-6">
      <h1 className="text-2xl font-semibold">Edit client</h1>
      <ClientForm
        action={updateClientAction}
        submitLabel="Save"
        defaultValues={{
          id: client.id,
          name: client.name,
          email: client.email ?? "",
          phone: client.phone ?? "",
          address: addr,
        }}
      />
    </main>
  );
}
