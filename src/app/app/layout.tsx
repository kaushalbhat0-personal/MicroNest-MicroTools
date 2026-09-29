import { redirect } from "next/navigation";
import { getCurrentFirmForSession } from "@/modules/firm/services/get-current-firm";
import { isSubscribed } from "@/modules/billing/services/entitlements";
import { AppNav } from "@/components/layout/app-nav";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, firm } = await getCurrentFirmForSession();
  if (!user) redirect("/login");
  if (!firm) redirect("/onboarding");
  const [isNoticeflowSubscribed, isMattervaultSubscribed] = await Promise.all([
    isSubscribed(firm.id, "noticeflow"),
    isSubscribed(firm.id, "mattervault"),
  ]);
  return (
    <>
      <AppNav isNoticeflowSubscribed={isNoticeflowSubscribed} isMattervaultSubscribed={isMattervaultSubscribed} />
      {children}
    </>
  );
}
