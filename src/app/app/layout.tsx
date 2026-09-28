import { redirect } from "next/navigation";
import { getCurrentFirmForSession } from "@/modules/firm/services/get-current-firm";
import { AppNav } from "@/components/layout/app-nav";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, firm } = await getCurrentFirmForSession();
  if (!user) redirect("/login");
  if (!firm) redirect("/onboarding");
  return (
    <>
      <AppNav />
      {children}
    </>
  );
}
