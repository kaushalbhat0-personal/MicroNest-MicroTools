import Link from "next/link";
import { getCurrentFirmForSession } from "@/modules/firm/services/get-current-firm";
import { isSubscribed } from "@/modules/billing/services/entitlements";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function BillingPage() {
  const { firm } = await getCurrentFirmForSession();
  if (!firm) return null;
  const [noticeflow, mattervault] = await Promise.all([
    isSubscribed(firm.id, "noticeflow"),
    isSubscribed(firm.id, "mattervault"),
  ]);

  const items = [
    {
      slug: "noticeflow" as const,
      name: "NoticeFlow",
      description: "Notice workflow for CA firms — GST and income-tax notices from receipt to closure.",
      subscribed: noticeflow,
      href: "/app/notices",
    },
    {
      slug: "mattervault" as const,
      name: "MatterVault",
      description: "Client document collection and matter file organization for litigators.",
      subscribed: mattervault,
      href: "/app/matters",
    },
  ];

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-6">
      <PageHeader title="Billing" description="Subscriptions — informational placeholder (P2). No checkout yet." />
      <div className="rounded-md border p-4">
        <p className="text-sm">
          Firm: <span className="font-medium">{firm.name}</span> — {firm.slug}
        </p>
        <p className="text-xs text-muted-foreground">Subscriptions are firm-level. Members share access via firm membership.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {items.map((it) => (
          <div key={it.slug} className="rounded-md border p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">{it.name}</h3>
              <Badge variant={it.subscribed ? "default" : "outline"}>{it.subscribed ? "Subscribed" : "Not subscribed"}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{it.description}</p>
            {it.subscribed ? (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Status:</span> <Badge>active</Badge>
                <Link href={it.href} className="ml-auto inline-flex rounded-md border px-3 py-1">
                  Open
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Not subscribed — contact billing to enable.</p>
                <p className="text-xs text-muted-foreground">Checkout, invoices, and provider integration are P3.</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
        <p>Future subscription management (checkout, Razorpay/Stripe, invoices, webhooks, pricing) is P3 and not implemented in P2.</p>
        <p className="mt-1">
          Need access? <span className="font-medium">Ask your firm owner to update billing.</span>
        </p>
      </div>
    </main>
  );
}
