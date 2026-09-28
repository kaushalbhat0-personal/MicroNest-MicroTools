import { ClientForm } from "@/modules/client/components/client-form";
import { createClientAction } from "@/modules/client/actions/create-client";

export default function NewClientPage() {
  return (
    <main className="mx-auto max-w-md space-y-6 p-6">
      <h1 className="text-2xl font-semibold">New client</h1>
      <ClientForm action={createClientAction} submitLabel="Create" />
    </main>
  );
}
