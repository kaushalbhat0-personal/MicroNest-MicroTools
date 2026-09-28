import { notFound } from "next/navigation";
import { getMatterForCurrentFirm } from "@/modules/matter/services/get-matter";
import { listClientsForCurrentFirm } from "@/modules/client/services/list-clients";
import { MatterForm } from "@/modules/matter/components/matter-form";
import { createServerSupabaseClient } from "@/infrastructure/database/supabase-server";
import { getCurrentFirmForSession } from "@/modules/firm/services/get-current-firm";
import { listMembersByFirm } from "@/modules/firm/repositories/firm-repository";

export const dynamic = "force-dynamic";

export default async function EditMatterPage({ params }: { params: Promise<{ matterId: string }> }) {
  const { matterId } = await params;
  const matter = await getMatterForCurrentFirm(matterId);
  if (!matter) notFound();
  const clients = await listClientsForCurrentFirm(true);
  const { firm } = await getCurrentFirmForSession();
  const supabase = await createServerSupabaseClient();
  const members = firm ? await listMembersByFirm(supabase, firm.id) : [];

  return (
    <main className="mx-auto max-w-2xl space-y-6 p-6">
      <h1 className="text-2xl font-semibold">Edit matter</h1>
      <MatterForm clients={clients} members={members} matter={matter} mode="edit" />
    </main>
  );
}
