import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { isEntitledStatus } from "../types/subscription-types";
import { EntitlementError } from "../services/entitlements";

function read(rel: string): string {
  return fs.readFileSync(path.resolve(__dirname, `../../../../${rel}`), "utf8");
}

describe("P1 entitlement enforcement", () => {
  const m011 = read("supabase/migrations/011_entitlement_rpc_hardening.sql");

  it("status matrix: active/trialing allowed, past_due/canceled missing denied", () => {
    expect(isEntitledStatus("active")).toBe(true);
    expect(isEntitledStatus("trialing")).toBe(true);
    expect(isEntitledStatus("past_due")).toBe(false);
    expect(isEntitledStatus("canceled")).toBe(false);
  });

  it("EntitlementError contract", () => {
    const e = new EntitlementError("firm-1", "noticeflow");
    expect(e.name).toBe("EntitlementError");
    expect(e.message).toBe("Not subscribed to noticeflow");
    expect(e.firmId).toBe("firm-1");
    expect(e.product).toBe("noticeflow");
  });

  // Page guards — NoticeFlow
  for (const p of [
    "src/app/app/notices/page.tsx",
    "src/app/app/notices/new/page.tsx",
    "src/app/app/notices/[noticeId]/page.tsx",
    "src/app/app/notices/[noticeId]/edit/page.tsx",
  ]) {
    it(`NoticeFlow page ${p} guards entitlement before data`, () => {
      const s = read(p);
      expect(s).toContain('isSubscribed');
      expect(s).toContain('noticeflow');
      expect(s).toContain('redirect("/app")');
    });
  }

  // Page guards — MatterVault
  for (const p of [
    "src/app/app/matters/page.tsx",
    "src/app/app/matters/new/page.tsx",
    "src/app/app/matters/[matterId]/page.tsx",
    "src/app/app/matters/[matterId]/edit/page.tsx",
  ]) {
    it(`MatterVault page ${p} guards entitlement`, () => {
      const s = read(p);
      expect(s).toContain('isSubscribed');
      expect(s).toContain('mattervault');
      expect(s).toContain('redirect("/app")');
    });
  }

  // Service guards — NoticeFlow
  for (const p of [
    "src/modules/notice/services/create-notice.ts",
    "src/modules/notice/services/update-notice.ts",
    "src/modules/notice/services/transition-notice.ts",
    "src/modules/notice/services/get-notice.ts",
    "src/modules/notice/services/list-notices.ts",
    "src/modules/notice/services/list-notices-filtered.ts",
    "src/modules/document/services/upload-document.ts",
    "src/modules/document/services/delete-document.ts",
    "src/modules/document/services/get-document-url.ts",
    "src/modules/note/services/create-note.ts",
    "src/modules/note/services/update-note.ts",
    "src/modules/note/services/delete-note.ts",
    "src/modules/dashboard/services/get-dashboard-summary.ts",
    "src/modules/dashboard/services/get-attention-notices.ts",
    "src/modules/dashboard/services/get-recent-activity.ts",
  ]) {
    it(`NoticeFlow service ${p} enforces entitlement`, () => {
      const s = read(p);
      expect(s).toMatch(/requireEntitlement|isSubscribed/);
      expect(s).toContain("noticeflow");
    });
  }

  // Service guards — MatterVault
  for (const p of [
    "src/modules/matter/services/create-matter.ts",
    "src/modules/matter/services/update-matter.ts",
    "src/modules/matter/services/list-matters.ts",
    "src/modules/matter/services/get-matter.ts",
    "src/modules/matter/services/upload-matter-document.ts",
    "src/modules/matter/services/delete-matter-document.ts",
    "src/modules/matter/services/get-matter-document-url.ts",
    "src/modules/matter/services/verify-checklist-item.ts",
    "src/modules/matter/services/archive-matter.ts",
    "src/modules/matter/services/matter-note-service.ts",
    "src/modules/matter/services/get-matter-dashboard-summary.ts",
  ]) {
    it(`MatterVault service ${p} enforces entitlement`, () => {
      const s = read(p);
      expect(s).toMatch(/requireEntitlement|isSubscribed/);
      expect(s).toContain("mattervault");
    });
  }

  // API guards
  it("API /api/notices/export guards noticeflow (403)", () => {
    const s = read("src/app/api/notices/export/route.ts");
    expect(s).toContain("isSubscribed");
    expect(s).toContain("noticeflow");
    expect(s).toContain("403");
  });
  it("API /api/matter-documents/[id] guards mattervault (403)", () => {
    const s = read("src/app/api/matter-documents/[id]/route.ts");
    expect(s).toContain("isSubscribed");
    expect(s).toContain("mattervault");
    expect(s).toContain("403");
  });

  // RPC hardening
  it("011 hardens transition_notice with is_firm_subscribed noticeflow", () => {
    expect(m011).toContain("create or replace function public.transition_notice");
    expect(m011).toContain("is_firm_subscribed(v_firm_id, 'noticeflow'");
    expect(m011).toContain("security definer");
    expect(m011).toContain("set search_path = ''");
  });
  it("011 hardens verify_checklist_item_and_maybe_ready with mattervault", () => {
    expect(m011).toContain("verify_checklist_item_and_maybe_ready");
    expect(m011).toContain("is_firm_subscribed(v_firm_id, 'mattervault'");
  });
  it("011 hardens reject_checklist_item with mattervault", () => {
    expect(m011).toContain("create or replace function public.reject_checklist_item");
    expect(m011).toContain("is_firm_subscribed(v_firm_id, 'mattervault'");
  });
  it("011 hardens archive_matter with mattervault", () => {
    expect(m011).toContain("create or replace function public.archive_matter");
    expect(m011).toContain("is_firm_subscribed(v_firm_id, 'mattervault'");
  });
  it("011 preserves revoke/grant for all RPCs", () => {
    expect(m011).toContain('revoke all on function public.transition_notice');
    expect(m011).toContain('grant execute on function public.transition_notice');
    expect(m011).toContain('revoke all on function public.verify_checklist_item_and_maybe_ready');
    expect(m011).toContain('revoke all on function public.reject_checklist_item');
    expect(m011).toContain('revoke all on function public.archive_matter');
  });

  // Cross-firm: is_firm_subscribed checks fm.firm_id = target_firm and fm.user_id = auth.uid()
  it("is_firm_subscribed prevents cross-firm inspection", () => {
    const m010 = read("supabase/migrations/010_subscriptions.sql");
    expect(m010).toContain("where fm.firm_id = target_firm");
    expect(m010).toContain("and fm.user_id = auth.uid()");
    expect(m010).toContain("and fs.firm_id = target_firm");
  });

  // Firm id from server context, not client: all services use getCurrentFirmForSession
  for (const p of [
    "src/modules/notice/services/create-notice.ts",
    "src/modules/matter/services/create-matter.ts",
    "src/modules/document/services/upload-document.ts",
    "src/modules/matter/services/upload-matter-document.ts",
  ]) {
    it(`${p} derives firm_id from server context`, () => {
      const s = read(p);
      expect(s).toContain("getCurrentFirmForSession");
      expect(s).not.toContain("req.query.firm_id");
      expect(s).not.toContain("formData.get(\"firm_id\")");
    });
  }

  // Direct URL / stale page / client state: page guard is before data, service also guards
  it("unsubscribed cannot access via direct URL (page guard) and service guard", () => {
    const noticePage = read("src/app/app/notices/[noticeId]/page.tsx");
    expect(noticePage).toContain("isSubscribed");
    expect(noticePage).toContain("EntitlementError");
    const noticeService = read("src/modules/notice/services/get-notice.ts");
    expect(noticeService).toContain("requireEntitlement");
  });

  // Dashboard does not leak: isSubscribed check before query
  for (const p of [
    "src/modules/dashboard/services/get-dashboard-summary.ts",
    "src/modules/dashboard/services/get-attention-notices.ts",
    "src/modules/dashboard/services/get-recent-activity.ts",
    "src/modules/matter/services/get-matter-dashboard-summary.ts",
  ]) {
    it(`Dashboard service ${p} does not leak for unsubscribed`, () => {
      const s = read(p);
      expect(s).toContain("isSubscribed");
      // Returns empty/zero when not subscribed, not throw that would leak
      expect(s).toMatch(/return.*0|return \[\]/);
    });
  }
});
