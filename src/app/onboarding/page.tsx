import { redirect } from "next/navigation";
import { createFirmAction } from "@/modules/firm/actions/create-firm";
import { CreateFirmForm } from "@/modules/firm/components/create-firm-form";
import { getCurrentFirmForSession } from "@/modules/firm/services/get-current-firm";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const { user, firm } = await getCurrentFirmForSession();
  if (!user) redirect("/login");
  if (firm) redirect("/app");

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 p-6">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold">Create your firm</h1>
        <p className="text-sm text-muted-foreground">You will be the OWNER. This creates your tenant.</p>
      </div>
      <CreateFirmForm action={createFirmAction} />
    </main>
  );
}
