import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function read(rel: string): string {
  return fs.readFileSync(path.resolve(__dirname, `../../../../${rel}`), "utf8");
}

describe("P2 firm workspace + product separation", () => {
  it("AppNav has Firm group and MicroTools group with explicit links", () => {
    const s = read("src/components/layout/app-nav.tsx");
    expect(s).toContain('label: "Firm"');
    expect(s).toContain('label: "MicroTools"');
    expect(s).toContain('"/app/clients"');
    expect(s).toContain('"/app/members"');
    expect(s).toContain('"/app/settings"');
    expect(s).toContain('"/app/billing"');
    expect(s).toContain("isNoticeflowSubscribed");
    expect(s).toContain("isMattervaultSubscribed");
    // Filtered via subscribed flags, not client state
    expect(s).toContain("microtoolChildren");
    expect(s).not.toContain("localStorage");
    expect(s).not.toContain("useState");
  });

  it("AppNav does not create generic navigation engine", () => {
    const s = read("src/components/layout/app-nav.tsx");
    expect(s).not.toContain("navigationRegistry");
    expect(s).not.toContain("plugin");
    expect(s).not.toContain("dynamic product framework");
    expect(s).not.toContain("getNavigationConfig");
  });

  it("AppLayout resolves subscriptions server-side and passes to AppNav", () => {
    const s = read("src/app/app/layout.tsx");
    expect(s).toContain("isSubscribed");
    expect(s).toContain("noticeflow");
    expect(s).toContain("mattervault");
    expect(s).toContain("AppNav");
    expect(s).toContain("isNoticeflowSubscribed");
    expect(s).toContain("isMattervaultSubscribed");
    expect(s).not.toContain("useEffect");
    expect(s).not.toContain("useState");
  });

  it("Dashboard is platform/firm dashboard, conditional fetching", () => {
    const s = read("src/app/app/page.tsx");
    expect(s).toContain("Firm workspace");
    expect(s).toContain("isSubscribed");
    expect(s).toContain("isNoticeflowSubscribed");
    expect(s).toContain("isMattervaultSubscribed");
    // Conditional fetching
    expect(s).toContain("isNoticeflowSubscribed ? await getDashboardSummary");
    expect(s).toContain("isMattervaultSubscribed ? await getMatterDashboardSummary");
    expect(s).not.toContain("await getDashboardSummary();\n  const attention = await getAttentionNotices");
    // Firm quick links
    expect(s).toContain('"/app/clients"');
    expect(s).toContain('"/app/members"');
    expect(s).toContain('"/app/settings"');
    expect(s).toContain('"/app/billing"');
    // MicroTools section
    expect(s).toContain("MicroTools");
    expect(s).toContain("NoticeFlow");
    expect(s).toContain("MatterVault");
    expect(s).toContain("Subscribed");
    expect(s).toContain("Not subscribed");
    expect(s).toContain("Explore");
  });

  it("Dashboard unsubscribed discovery does not show fake metrics", () => {
    const s = read("src/app/app/page.tsx");
    // Unsubscribed branch is border-dashed, not metrics
    expect(s).toContain("border-dashed");
    expect(s).not.toContain("getDashboardSummary() : null; const attention = await getAttentionNotices");
    // Ensure not fetching both and hiding
    expect(s).not.toMatch(/await getDashboardSummary\(\);\s+await getMatterDashboardSummary\(\)/);
  });

  it("Settings page is minimal firm shell", () => {
    const s = read("src/app/app/settings/page.tsx");
    expect(s).toContain("Settings");
    expect(s).toContain("Firm");
    expect(s).toContain("Account");
    expect(s).not.toContain("Razorpay");
    expect(s).not.toContain("Stripe");
    expect(s).not.toContain("checkout");
  });

  it("Billing page is informational placeholder, no checkout", () => {
    const s = read("src/app/app/billing/page.tsx");
    expect(s).toContain("Billing");
    expect(s).toContain("Subscriptions");
    expect(s).toContain("isSubscribed");
    expect(s).toContain("noticeflow");
    expect(s).toContain("mattervault");
    expect(s).toContain("P3");
    expect(s).not.toContain("createCheckout");
    expect(s).not.toContain("stripe(");
  });

  it("Billing uses existing firm_subscriptions data, no new product registry", () => {
    const s = read("src/app/app/billing/page.tsx");
    expect(s).toMatch(/isSubscribed/);
    expect(s).not.toContain("productRegistry");
  });

  it("Clients remains firm-level, not product-owned", () => {
    const clientsPage = read("src/app/app/clients/page.tsx");
    expect(clientsPage).not.toContain("product");
    expect(clientsPage).not.toContain("noticeflow");
    expect(clientsPage).not.toContain("mattervault");
    const clientsRepo = read("src/modules/client/repositories/client-repository.ts");
    expect(clientsRepo).toContain("firm_id");
    expect(clientsRepo).not.toContain("product");
  });

  it("Visual design uses app primitives, not marketing theme", () => {
    const dash = read("src/app/app/page.tsx");
    expect(dash).toContain("rounded-md border");
    expect(dash).not.toContain("mn-marketing");
    expect(dash).not.toContain(".mn-");
    const billing = read("src/app/app/billing/page.tsx");
    expect(billing).not.toContain("mn-marketing");
  });

  it("Navigation filtering is server-derived, not client state", () => {
    const nav = read("src/components/layout/app-nav.tsx");
    const layout = read("src/app/app/layout.tsx");
    expect(nav).not.toContain("window");
    expect(nav).not.toContain("localStorage");
    expect(layout).toContain("getCurrentFirmForSession");
    expect(layout).toContain("isSubscribed");
  });

  it("Multi-product scenarios: both subscribed, single, neither", () => {
    const dash = read("src/app/app/page.tsx");
    expect(dash).toContain("isNoticeflowSubscribed ?");
    expect(dash).toContain("isMattervaultSubscribed ?");
    // Both subscribed shows both cards with metrics
    expect(dash).toContain("Open NoticeFlow");
    expect(dash).toContain("Open MatterVault");
    // Neither shows discovery
    expect(dash).toContain("Explore NoticeFlow");
    expect(dash).toContain("Explore MatterVault");
  });
});
